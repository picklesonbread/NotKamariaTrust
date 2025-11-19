const { EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

module.exports = {
    name: 'coins',
    aliases: ['economy', 'balance', 'wallet'],
    description: 'Economy commands for coins and bamboo',

    async execute(message, args, client) {
        const userId = message.author.id;
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

        const subcommand = args[0]?.toLowerCase();

        switch (subcommand) {
            case 'give':
            case 'transfer':
                return this.transferCoins(message, args, userData);

            case 'earn':
            case 'work':
                return this.earnCoins(message, userId);

            case 'gamble':
            case 'bet':
                return this.gambleCoins(message, args, userData, userId);

            case 'leaderboard':
            case 'top':
                return this.showLeaderboard(message, userData, client);

            case 'shop':
                return this.showShop(message);

            default:
                return this.showBalance(message, userData[userId]);
        }
    },

    async showBalance(message, user) {
        const userId = message.author.id;
        let userData = user;
        
        // Try to get data from database first
        if (database && database.isInitialized()) {
            try {
                const dbUser = await database.getUserProfile(userId, message.author.username);
                if (dbUser) {
                    userData = dbUser;
                }
            } catch (error) {
                console.log('Failed to fetch user from database, using JSON:', error.message);
            }
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🪙 Panda Wallet')
            .setColor('#ffd700')
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                { name: '💰 Coins', value: userData.coins.toString(), inline: true },
                { name: '⭐ Level', value: userData.level.toString(), inline: true }
            )
            .setFooter({ text: 'Use !coins earn to get more coins!' });

        message.reply({ embeds: [embed] });
    },

    async earnCoins(message, userId) {
        let storage = (database && database.isInitialized()) ? 'db' : 'json';
        let user;

        // Try to get user from database first
        if (storage === 'db') {
            try {
                user = await database.getUserProfile(userId, message.author.username);
                if (!user) throw new Error('Database unavailable');
            } catch (error) {
                console.log('Database error, falling back to JSON storage:', error.message);
                storage = 'json';
            }
        }

        // Fall back to JSON storage if needed
        if (storage === 'json') {
            const userData = loadUserData();
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

        const now = Date.now();
        const cooldown = 30 * 60 * 1000; // 30 minutes
        const lastWork = user.last_work ? new Date(user.last_work).getTime() : (user.lastWork || 0);

        // Check cooldown
        if (lastWork && (now - lastWork) < cooldown) {
            const timeLeft = Math.ceil((cooldown - (now - lastWork)) / 60000);
            return message.reply(`🕐 You need to wait ${timeLeft} more minutes before working again!`);
        }

        const earnAmount = Math.floor(Math.random() * 31) + 10; // 10-40 coins
        const xpReward = 5;
        const activities = [
            'collected bamboo in the forest',
            'played with other pandas',
            'cleaned the treehouse',
            'helped at the Panfu café',
            'taught younger pandas',
            'organized a panda party',
            'explored new areas',
            'completed daily exercises'
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];

        // Get current stats
        const currentStats = user.stats || {
            friendship: 50,
            energy: 100,
            happiness: 75,
            bamboo_eaten: 0,
            games_played: 0,
            days_active: 1
        };

        const updatedStats = {
            ...currentStats,
            happiness: Math.min(100, currentStats.happiness + 2)
        };

        if (storage === 'db') {
            try {
                // Update coins, stats, and cooldown
                await database.updateUserProfile(userId, {
                    coins: user.coins + earnAmount,
                    last_work: new Date(now).toISOString(),
                    stats: updatedStats
                });

                // Add XP using centralized system (handles level-up automatically)
                const xpResult = await database.addUserXP(userId, xpReward, message.guild?.id);

                // Get updated user data
                const updatedUser = await database.getUserProfile(userId, message.author.username);
                if (updatedUser) {
                    user = updatedUser;
                }

                // Send success message
                const embed = new EmbedBuilder()
                    .setTitle('💼 Work Complete!')
                    .setDescription(`You ${activity} and earned **${earnAmount} coins**! 🪙`)
                    .setColor('#4a90e2')
                    .addFields(
                        { name: '💰 New Balance', value: user.coins.toString(), inline: true },
                        { name: '💫 Experience', value: `+${xpReward} XP`, inline: true },
                        { name: '📊 Level', value: user.level.toString(), inline: true }
                    );

                await message.reply({ embeds: [embed] });

                // If user leveled up, send level-up notification
                if (xpResult && xpResult.leveledUp) {
                    const levelUpEmbed = new EmbedBuilder()
                        .setTitle('🎉 Level Up!')
                        .setDescription(`Congratulations! You reached **Level ${xpResult.newLevel}**!`)
                        .setColor('#00ff00')
                        .addFields(
                            { name: '✨ Total XP', value: `${xpResult.totalXP} XP`, inline: true },
                            { name: '📊 Level', value: `${xpResult.oldLevel} → ${xpResult.newLevel}`, inline: true }
                        );

                    await message.channel.send({ embeds: [levelUpEmbed] });
                }
            } catch (error) {
                console.log('Database update failed, using JSON fallback:', error.message);
                storage = 'json';
            }
        }

        // JSON storage fallback
        if (storage === 'json') {
            const userData = loadUserData();
            
            // Calculate level before adding XP
            const oldLevel = database ? database.calculateLevelFromXP(userData[userId].experience) : userData[userId].level;
            
            // Add rewards
            userData[userId].coins += earnAmount;
            userData[userId].experience += xpReward;
            userData[userId].stats = updatedStats;
            userData[userId].lastWork = now;
            
            // Calculate new level after adding XP
            const newLevel = database ? database.calculateLevelFromXP(userData[userId].experience) : oldLevel;
            const leveledUp = newLevel > oldLevel;
            
            // Update level in user data
            userData[userId].level = newLevel;
            
            saveUserData(userData);
            user = userData[userId];

            // Send work complete message
            const embed = new EmbedBuilder()
                .setTitle('💼 Work Complete!')
                .setDescription(`You ${activity} and earned **${earnAmount} coins**! 🪙`)
                .setColor('#4a90e2')
                .addFields(
                    { name: '💰 New Balance', value: user.coins.toString(), inline: true },
                    { name: '💫 Experience', value: `+${xpReward} XP (${user.experience} total)`, inline: true },
                    { name: '📊 Level', value: user.level.toString(), inline: true }
                );

            await message.reply({ embeds: [embed] });
            
            // Send level-up notification if user leveled up
            if (leveledUp) {
                const levelUpEmbed = new EmbedBuilder()
                    .setTitle('🎉 Level Up!')
                    .setDescription(`Congratulations! You reached **Level ${newLevel}**!`)
                    .setColor('#00ff00')
                    .addFields(
                        { name: '✨ Total XP', value: `${user.experience} XP`, inline: true },
                        { name: '📊 Level', value: `${oldLevel} → ${newLevel}`, inline: true }
                    );
                
                await message.channel.send({ embeds: [levelUpEmbed] });
            }
        }
    },

    async transferCoins(message, args, userData) {
        const sender = message.author;
        const senderId = sender.id;
        const mention = message.mentions.users.first();
        const amount = parseInt(args[2]);

        // Validation
        if (!mention) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 No User Mentioned')
                .setDescription('Please mention a user to give coins to!\n\nExample: `!economy give @user 50`')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        if (mention.bot) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Cannot Give to Bots')
                .setDescription('You cannot give coins to bots!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        if (mention.id === senderId) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Cannot Give to Yourself')
                .setDescription('You cannot give coins to yourself!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        if (!amount || amount <= 0 || isNaN(amount)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Invalid Amount')
                .setDescription('Please specify a valid amount to give!\n\nExample: `!economy give @user 50`')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Try database first
        if (database && database.isInitialized()) {
            try {
                // Get both users from database
                const senderData = await database.getUserProfile(senderId, sender.username);
                const recipientData = await database.getUserProfile(mention.id, mention.username);

                if (!senderData || !recipientData) {
                    throw new Error('Failed to fetch user data');
                }

                if (senderData.coins < amount) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('🚫 Insufficient Coins')
                        .setDescription(`You only have **${senderData.coins} coins** but need **${amount} coins**!`)
                        .setTimestamp();
                    return message.reply({ embeds: [errorEmbed] });
                }

                // Transfer coins
                await database.updateUserCoins(senderId, -amount);
                await database.updateUserCoins(mention.id, amount);

                // Update friendship stats
                await database.updateUserStats(senderId, { friendship: Math.min(100, senderData.stats.friendship + 2) });
                await database.updateUserStats(mention.id, { friendship: Math.min(100, recipientData.stats.friendship + 2) });

                // Get updated balances
                const updatedSender = await database.getUserProfile(senderId, sender.username);
                const updatedRecipient = await database.getUserProfile(mention.id, mention.username);

                const embed = new EmbedBuilder()
                    .setTitle('💝 Coin Transfer Successful!')
                    .setDescription(`${sender} gave **${amount} coins** to ${mention}!`)
                    .setColor('#ff69b4')
                    .addFields(
                        { name: `${sender.username}'s Balance`, value: updatedSender.coins.toString(), inline: true },
                        { name: `${mention.username}'s Balance`, value: updatedRecipient.coins.toString(), inline: true }
                    );

                return message.reply({ embeds: [embed] });
            } catch (error) {
                console.log('Database transfer failed, using JSON fallback:', error.message);
            }
        }

        // JSON fallback
        if (!userData[senderId]) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Profile Not Found')
                .setDescription('You need to create a panda profile first! Send a message to get started.')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        if (userData[senderId].coins < amount) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Insufficient Coins')
                .setDescription(`You only have **${userData[senderId].coins} coins** but need **${amount} coins**!`)
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Initialize recipient if needed
        if (!userData[mention.id]) {
            userData[mention.id] = {
                pandaName: mention.username + "'s Panda",
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
        }

        // Transfer coins
        userData[senderId].coins -= amount;
        userData[mention.id].coins += amount;

        // Increase friendship for both users
        userData[senderId].stats.friendship = Math.min(100, userData[senderId].stats.friendship + 2);
        userData[mention.id].stats.friendship = Math.min(100, userData[mention.id].stats.friendship + 2);

        saveUserData(userData);

        const embed = new EmbedBuilder()
            .setTitle('💝 Coin Transfer Successful!')
            .setDescription(`${sender} gave **${amount} coins** to ${mention}!`)
            .setColor('#ff69b4')
            .addFields(
                { name: `${sender.username}'s Balance`, value: userData[senderId].coins.toString(), inline: true },
                { name: `${mention.username}'s Balance`, value: userData[mention.id].coins.toString(), inline: true }
            );

        message.reply({ embeds: [embed] });
    },

    async gambleCoins(message, args, userData, userId) {
        const amount = parseInt(args[1]);

        if (!amount || amount <= 0 || isNaN(amount)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Invalid Amount')
                .setDescription('Please specify a valid amount to gamble!\n\nExample: `!economy gamble 50`')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        if (amount < 10) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Bet Too Low')
                .setDescription('Minimum bet is **10 coins**!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Calculate gamble result
        const chance = Math.random();
        let result, multiplier;

        if (chance < 0.4) { // 40% chance to win
            multiplier = 1.5;
            result = 'win';
        } else if (chance < 0.7) { // 30% chance to break even
            multiplier = 1;
            result = 'tie';
        } else { // 30% chance to lose
            multiplier = 0;
            result = 'lose';
        }

        const winAmount = Math.floor(amount * multiplier);
        const netGain = winAmount - amount;

        // Try database first
        if (database && database.isInitialized()) {
            try {
                const user = await database.getUserProfile(userId, message.author.username);
                if (!user) throw new Error('User not found');

                if (amount > user.coins) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('🚫 Insufficient Coins')
                        .setDescription(`You only have **${user.coins} coins** but need **${amount} coins**!`)
                        .setTimestamp();
                    return message.reply({ embeds: [errorEmbed] });
                }

                // Update coins
                await database.updateUserCoins(userId, netGain);
                const updatedUser = await database.getUserProfile(userId, message.author.username);

                let color, description;
                if (result === 'win') {
                    color = '#00ff00';
                    description = `🎉 You won! The bamboo gods smile upon you!\n**+${netGain} coins**`;
                } else if (result === 'tie') {
                    color = '#ffff00';
                    description = `😐 It's a tie! You get your coins back.\n**±0 coins**`;
                } else {
                    color = '#ff0000';
                    description = `😞 You lost! Better luck next time!\n**-${amount} coins**`;
                }

                const embed = new EmbedBuilder()
                    .setTitle('🎲 Bamboo Gambling')
                    .setDescription(description)
                    .setColor(color)
                    .addFields({ name: '💰 New Balance', value: updatedUser.coins.toString(), inline: true });

                return message.reply({ embeds: [embed] });
            } catch (error) {
                console.log('Database gamble failed, using JSON fallback:', error.message);
            }
        }

        // JSON fallback
        const user = userData[userId];
        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Profile Not Found')
                .setDescription('You need to create a panda profile first! Send a message to get started.')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        if (amount > user.coins) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Insufficient Coins')
                .setDescription(`You only have **${user.coins} coins** but need **${amount} coins**!`)
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        user.coins += netGain;
        userData[userId] = user;
        saveUserData(userData);

        let color, description;

        if (result === 'win') {
            color = '#00ff00';
            description = `🎉 You won! The bamboo gods smile upon you!\n**+${netGain} coins**`;
        } else if (result === 'tie') {
            color = '#ffff00';
            description = `😐 It's a tie! You get your coins back.\n**±0 coins**`;
        } else {
            color = '#ff0000';
            description = `😞 You lost! Better luck next time!\n**-${amount} coins**`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎲 Bamboo Gambling')
            .setDescription(description)
            .setColor(color)
            .addFields({ name: '💰 New Balance', value: user.coins.toString(), inline: true });

        message.reply({ embeds: [embed] });
    },

    async showLeaderboard(message, userData, client) {
        let users = [];

        // Try database first
        if (database && database.isInitialized()) {
            try {
                const leaderboard = await database.getLeaderboard(10);
                if (leaderboard && leaderboard.length > 0) {
                    users = leaderboard.map(u => [u.user_id, { coins: u.coins, level: u.level }]);
                } else {
                    throw new Error('No users in database leaderboard');
                }
            } catch (error) {
                console.log('Database leaderboard failed, using JSON fallback:', error.message);
            }
        }

        // JSON fallback
        if (users.length === 0) {
            users = Object.entries(userData)
                .sort(([,a], [,b]) => b.coins - a.coins)
                .slice(0, 10);
        }

        if (users.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('📊 Leaderboard Empty')
                .setDescription('No users found in the leaderboard yet! Start earning coins to appear here.')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        let description = '';

        for (let i = 0; i < users.length; i++) {
            const [userId, user] = users[i];
            try {
                const discordUser = await client.users.fetch(userId);
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                description += `${medal} **<@${userId}>** - ${user.coins} coins\n`;
            } catch (error) {
                // Skip users that can't be fetched
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Richest Pandas Leaderboard')
            .setDescription(description)
            .setColor('#ffd700');

        message.reply({ embeds: [embed] });
    },

    showShop(message) {
        const embed = new EmbedBuilder()
            .setTitle('🏪 Panda Shop')
            .setDescription('Welcome to the Panfu shop! Here you can buy items with your coins.')
            .setColor('#00ff88')
            .addFields(
                { name: '🎨 Panda Rename', value: '50 coins\nChange your panda\'s name', inline: true },
                { name: '🎋 Bamboo Snack', value: '25 coins\n+10 Happiness, +5 Energy', inline: true },
                { name: '🎁 Mystery Box', value: '100 coins\nRandom reward!', inline: true },
                { name: '👑 Premium Accessory', value: '200 coins\nExclusive accessories', inline: true },
                { name: '⚡ Energy Drink', value: '75 coins\nFull energy restore', inline: true },
                { name: '🤝 Friendship Boost', value: '150 coins\n+20 Friendship points', inline: true }
            )
            .setFooter({ text: 'Use !shop buy <item> to purchase items!' });

        message.reply({ embeds: [embed] });
    }
};
