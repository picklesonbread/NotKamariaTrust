const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const { PANDA_COLORS, PANDA_ACCESSORIES, PANDA_STATS } = require('../utils/constants');

// Import database utilities
const database = require('../utils/database');

module.exports = {
    name: 'profile',
    aliases: ['panda', 'avatar', 'me'],
    description: 'View or customize your panda profile',

    async execute(message, args, client) {
        const userId = message.author.id;
        let user;
        let usingDatabase = !!database;

        if (usingDatabase) {
            // Use database storage - get or create user profile
            user = await database.getUserProfile(userId, message.author.username);
            if (!user) {
                // Create new user profile in database
                user = await database.createUserProfile(userId, message.author.username);
            }

            // Convert database format to expected format for compatibility
            user = {
                pandaName: user.username + "'s Panda",
                color: 'classic',
                accessories: [],
                coins: user.coins || 100,
                level: user.level || 1,
                experience: user.experience || 0,
                stats: {
                    friendship: 50,
                    energy: 100,
                    happiness: 75,
                    bamboo_eaten: 0,
                    games_played: 0,
                    days_active: 1
                },
                lastDaily: null,
                joinDate: user.created_at || new Date().toISOString()
            };
        } else {
            // Fall back to JSON storage
            const userData = loadUserData();

            // Initialize user data if doesn't exist
            if (!userData[userId]) {
                userData[userId] = {
                    pandaName: message.author.username + "'s Panda",
                    color: 'classic',
                    accessories: [],
                    coins: 100,
                    level: 1,
                    experience: 0,
                    stats: {
                        friendship: 50,
                        energy: 100,
                        happiness: 75,
                        bamboo_eaten: 0,
                        games_played: 0,
                        days_active: 1
                    },
                    lastDaily: null,
                    joinDate: new Date().toISOString()
                };
                saveUserData(userData);
            }

            user = userData[userId];
        }

        const subcommand = args[0]?.toLowerCase();

        switch (subcommand) {
            case 'customize':
            case 'edit':
                return this.handleCustomization(message, args.slice(1), user, null, userId, usingDatabase);

            case 'stats':
                return this.showStats(message, user);

            case 'rename':
                return this.renamePanda(message, args.slice(1), user, null, userId, usingDatabase);

            default:
                return this.showProfile(message, user);
        }
    },

    async showProfile(message, user) {
        const embed = new EmbedBuilder()
            .setTitle(`🐼 ${user.pandaName}`)
            .setColor(PANDA_COLORS[user.color] || '#000000')
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                { name: '🎨 Color', value: user.color.charAt(0).toUpperCase() + user.color.slice(1), inline: true },
                { name: '⭐ Level', value: user.level.toString(), inline: true },
                { name: '🪙 Coins', value: user.coins.toString(), inline: true },
                { name: '❤️ Happiness', value: `${user.stats.happiness}/100`, inline: true },
                { name: '⚡ Energy', value: `${user.stats.energy}/100`, inline: true },
                { name: '🤝 Friendship', value: `${user.stats.friendship}/100`, inline: true }
            )
            .setFooter({ text: 'Use !panda customize to change your appearance!' });

        if (user.accessories.length > 0) {
            embed.addFields({ name: '👑 Accessories', value: user.accessories.join(', '), inline: false });
        }

        // Add achievement badges if database is available
        if (database && database.isInitialized()) {
            try {
                const result = await database.pool.query(
                    'SELECT achievements FROM discord_users WHERE user_id = $1',
                    [message.author.id]
                );

                if (result.rows.length > 0) {
                    const userAchievements = result.rows[0].achievements || {};
                    const unlockedCount = Object.values(userAchievements).filter(a => a.unlocked).length;
                    
                    if (unlockedCount > 0) {
                        // Get most recent achievements
                        const recentAchievements = Object.entries(userAchievements)
                            .filter(([_, data]) => data.unlocked)
                            .sort((a, b) => new Date(b[1].unlockedAt) - new Date(a[1].unlockedAt))
                            .slice(0, 3)
                            .map(([id]) => {
                                const { ACHIEVEMENTS } = require('./achievements');
                                for (const category in ACHIEVEMENTS) {
                                    const found = ACHIEVEMENTS[category].achievements.find(a => a.id === id);
                                    if (found) return `🏆 ${found.name}`;
                                }
                                return null;
                            })
                            .filter(Boolean);

                        embed.addFields({ 
                            name: `🏆 Achievements (${unlockedCount})`, 
                            value: recentAchievements.join('\n') || 'No achievements yet', 
                            inline: false 
                        });
                    }
                }
            } catch (error) {
                console.log('Could not load achievements for profile:', error.message);
            }
        }

        message.reply({ embeds: [embed] });
    },

    showStats(message, user) {
        const embed = new EmbedBuilder()
            .setTitle(`📊 ${user.pandaName}'s Statistics`)
            .setColor('#4a90e2')
            .addFields(
                { name: '🎮 Games Played', value: user.stats.games_played.toString(), inline: true },
                { name: '📅 Days Active', value: user.stats.days_active.toString(), inline: true },
                { name: '💫 Experience', value: `${user.experience}/100`, inline: true },
                { name: '🗓️ Member Since', value: new Date(user.joinDate).toDateString(), inline: true }
            );

        message.reply({ embeds: [embed] });
    },

    async handleCustomization(message, args, user, userData, userId, usingDatabase) {
        // Create color dropdown menu
        const colorMenu = new StringSelectMenuBuilder()
            .setCustomId('panda_color_select')
            .setPlaceholder('Choose a color for your panda...')
            .addOptions(
                Object.keys(PANDA_COLORS).map(color => ({
                    label: color.charAt(0).toUpperCase() + color.slice(1),
                    description: `Change your panda to ${color} color`,
                    value: color,
                    emoji: this.getColorEmoji(color)
                }))
            );

        // Create accessory dropdown menu  
        const accessoryMenu = new StringSelectMenuBuilder()
            .setCustomId('panda_accessory_select')
            .setPlaceholder('Choose an accessory...')
            .addOptions(
                PANDA_ACCESSORIES.map(accessory => ({
                    label: accessory.charAt(0).toUpperCase() + accessory.slice(1),
                    description: user.accessories.includes(accessory) ? 
                        `Remove ${accessory} from your panda` : 
                        `Add ${accessory} to your panda`,
                    value: accessory,
                    emoji: this.getAccessoryEmoji(accessory)
                }))
            );

        const embed = new EmbedBuilder()
            .setTitle('🎨 Panda Customization')
            .setDescription(`**Current Appearance:**\n🎨 **Color:** ${user.color.charAt(0).toUpperCase() + user.color.slice(1)}\n👑 **Accessories:** ${user.accessories.length > 0 ? user.accessories.join(', ') : 'None'}\n\nUse the dropdown menus below to customize your panda!`)
            .setColor(PANDA_COLORS[user.color] || '#000000')
            .setFooter({ text: 'You can wear up to 3 accessories at once!' });

        const colorRow = new ActionRowBuilder().addComponents(colorMenu);
        const accessoryRow = new ActionRowBuilder().addComponents(accessoryMenu);

        return message.reply({ 
            embeds: [embed], 
            components: [colorRow, accessoryRow] 
        });
    },

    getColorEmoji(color) {
        const colorEmojis = {
            classic: '⚫',
            brown: '🤎',
            white: '⚪',
            black: '⚫',
            red: '🔴',
            yellow: '🟡',
            blue: '🔵',
            darkblue: '🔷',
            green: '🟢',
            darkgreen: '🌲',
            pink: '🩷',
            purple: '🟣',
            magenta: '🟪',
            orange: '🟠'
        };
        return colorEmojis[color] || '🎨';
    },

    getAccessoryEmoji(accessory) {
        const accessoryEmojis = {
            hat: '🎩',
            glasses: '👓',
            bow: '🎀',
            scarf: '🧣',
            necklace: '📿',
            earrings: '💎',
            crown: '👑',
            mask: '🎭',
            bowtie: '🎀',
            headband: '👒'
        };
        return accessoryEmojis[accessory] || '👑';
    },

    async renamePanda(message, args, user, userData, userId, usingDatabase) {
        const newName = args.join(' ');

        if (!newName) {
            return message.reply('🚫 Please provide a new name for your panda!');
        }

        if (newName.length > 50) {
            return message.reply('🚫 Panda name must be 50 characters or less!');
        }

        if (user.coins < 50) {
            return message.reply('🚫 You need 50 coins to rename your panda!');
        }

        user.pandaName = newName;
        user.coins -= 50;

        if (usingDatabase) {
            // Update coins in database (user rename feature not in database yet)
            await database.updateUserProfile(userId, { coins: user.coins });
        } else {
            // Update JSON storage
            userData[userId] = user;
            saveUserData(userData);
        }

        message.reply(`🐼 Your panda has been renamed to **${newName}**! (-50 coins)`);
    }
};
