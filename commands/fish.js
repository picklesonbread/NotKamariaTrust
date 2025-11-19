const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

await interaction.deferReply();

// Fishing locations in Panfu
const LOCATIONS = {
    beach: {
        name: '🏖️ Panfu Beach',
        description: 'Crystal clear waters with tropical vibes',
        emoji: '🏖️'
    },
    swamp: {
        name: '🌿 Swamp of Sadness',
        description: 'Murky waters hide mysterious creatures',
        emoji: '🌿'
    },
    volcano: {
        name: '🌋 Volcano Lake',
        description: 'Steaming hot volcanic waters',
        emoji: '🌋'
    },
    pond: {
        name: '🌸 Cherry Blossom Pond',
        description: 'Peaceful pond near the bamboo forest',
        emoji: '🌸'
    }
};

// Fish types with rarities and rewards
const FISH = [
    // Common (50% chance)
    { name: 'Tiny Minnow', rarity: 'Common', coins: 5, emoji: '🐟', chance: 20 },
    { name: 'Bamboo Bass', rarity: 'Common', coins: 8, emoji: '🐟', chance: 15 },
    { name: 'Pond Perch', rarity: 'Common', coins: 10, emoji: '🐠', chance: 15 },
    
    // Uncommon (25% chance)
    { name: 'Disco Trout', rarity: 'Uncommon', coins: 20, emoji: '🐠', chance: 12 },
    { name: 'Volcanic Catfish', rarity: 'Uncommon', coins: 25, emoji: '🐠', chance: 8 },
    { name: 'Swamp Eel', rarity: 'Uncommon', coins: 22, emoji: '🐍', chance: 5 },
    
    // Rare (15% chance)
    { name: 'Golden Koi', rarity: 'Rare', coins: 50, emoji: '🐡', chance: 7 },
    { name: 'Rainbow Trout', rarity: 'Rare', coins: 55, emoji: '🌈', chance: 5 },
    { name: 'Ancient Carp', rarity: 'Rare', coins: 60, emoji: '🐡', chance: 3 },
    
    // Epic (8% chance)
    { name: 'Crystal Angelfish', rarity: 'Epic', coins: 100, emoji: '✨', chance: 4 },
    { name: 'Mystic Seahorse', rarity: 'Epic', coins: 120, emoji: '🌟', chance: 3 },
    { name: 'Lava Serpent', rarity: 'Epic', coins: 110, emoji: '🔥', chance: 1 },
    
    // Legendary (2% chance)
    { name: 'Kamaria\'s Goldfish', rarity: 'Legendary', coins: 250, emoji: '👑', chance: 1 },
    { name: 'Dragon Koi', rarity: 'Legendary', coins: 300, emoji: '🐉', chance: 0.5 },
    { name: 'Panfu Leviathan', rarity: 'Legendary', coins: 500, emoji: '🌊', chance: 0.5 }
];

// Junk items (sometimes you catch trash)
const JUNK = [
    { name: 'Old Boot', coins: 1, emoji: '👢' },
    { name: 'Rusty Can', coins: 2, emoji: '🥫' },
    { name: 'Broken Disco Ball', coins: 3, emoji: '🪩' },
    { name: 'Soggy Pizza Box', coins: 1, emoji: '📦' },
    { name: 'Kamaria\'s Lost Sunglasses', coins: 15, emoji: '🕶️' }
];

const COOLDOWN_TIME = 3 * 60 * 1000; // 3 minutes
const cooldowns = new Map();

module.exports = {
    name: 'fish',
    description: 'Cast your fishing rod at various Panfu locations!',

    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Cast your fishing rod at various Panfu locations!')
        .addStringOption(opt =>
            opt.setName('location')
                .setDescription('Where do you want to fish?')
                .setRequired(true)
                .addChoices(
                    { name: '🏖️ Panfu Beach', value: 'beach' },
                    { name: '🌿 Swamp of Sadness', value: 'swamp' },
                    { name: '🌋 Volcano Lake', value: 'volcano' },
                    { name: '🌸 Cherry Blossom Pond', value: 'pond' }
                )
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const location = interaction.options.getString('location');
        const locationData = LOCATIONS[location];

        // Check cooldown
        const now = Date.now();
        const cooldownEnd = cooldowns.get(userId);
        
        if (cooldownEnd && now < cooldownEnd) {
            const timeLeft = Math.ceil((cooldownEnd - now) / 1000 / 60);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('🎣 Fishing Rod Needs Rest')
                .setDescription(`Your fishing rod is tired! Wait **${timeLeft} minutes** before fishing again.`)
                .setTimestamp();
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Set cooldown
        cooldowns.set(userId, now + COOLDOWN_TIME);

        // Determine what was caught
        const catchRoll = Math.random() * 100;
        let caughtItem;
        let isJunk = false;

        // 10% chance to catch junk
        if (catchRoll < 10) {
            isJunk = true;
            caughtItem = JUNK[Math.floor(Math.random() * JUNK.length)];
        } else {
            // Calculate fish based on weighted chances
            let roll = Math.random() * 100;
            let cumulativeChance = 0;
            
            for (const fish of FISH) {
                cumulativeChance += fish.chance;
                if (roll <= cumulativeChance) {
                    caughtItem = fish;
                    break;
                }
            }
            
            // Fallback to common fish if nothing selected
            if (!caughtItem) {
                caughtItem = FISH[0];
            }
        }

        // Reward coins
        const coinsEarned = caughtItem.coins;
        
        // Try database first
        if (database && database.isInitialized()) {
            try {
                await database.updateUserCoins(userId, coinsEarned);
                
                // Track fish in collection (we'll add this to schema later)
                const user = await database.getUserProfile(userId, username);

                // Track achievement progress and fish collection
                if (!isJunk) {
                    const userDataResult = await database.pool.query(
                        'SELECT stats, fish_caught FROM discord_users WHERE user_id = $1',
                        [userId]
                    );

                    const stats = userDataResult.rows[0]?.stats || {};
                    stats.fish_caught = (stats.fish_caught || 0) + 1;
                    
                    // Track legendary fish separately
                    if (caughtItem.rarity === 'Legendary') {
                        stats.legendary_fish = (stats.legendary_fish || 0) + 1;
                    }

                    // Track individual caught fish
                    const fishCaught = userDataResult.rows[0]?.fish_caught || {};
                    if (fishCaught[caughtItem.name]) {
                        fishCaught[caughtItem.name]++;
                    } else {
                        fishCaught[caughtItem.name] = 1;
                    }

                    // Update stats using the proper merge function to avoid overwriting other fields like pet
                    await database.updateUserStats(userId, {
                        fish_caught: stats.fish_caught,
                        legendary_fish: stats.legendary_fish
                    });
                    
                    // Update fish_caught separately
                    await database.updateUserProfile(userId, {
                        fish_caught: fishCaught
                    });
                }
                
                // Determine color based on rarity
                let embedColor = '#808080';
                if (!isJunk) {
                    switch (caughtItem.rarity) {
                        case 'Common': embedColor = '#95a5a6'; break;
                        case 'Uncommon': embedColor = '#2ecc71'; break;
                        case 'Rare': embedColor = '#3498db'; break;
                        case 'Epic': embedColor = '#9b59b6'; break;
                        case 'Legendary': embedColor = '#f1c40f'; break;
                    }
                }

                const embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setTitle(`${locationData.emoji} Fishing at ${locationData.name}`)
                    .setDescription(`*${locationData.description}*\n\n🎣 You cast your line...`)
                    .addFields(
                        { 
                            name: isJunk ? '🗑️ You caught...' : '🐟 You caught!', 
                            value: `${caughtItem.emoji} **${caughtItem.name}**${isJunk ? '' : ` (${caughtItem.rarity})`}`, 
                            inline: true 
                        },
                        { 
                            name: '💰 Coins Earned', 
                            value: `+${coinsEarned} coins`, 
                            inline: true 
                        },
                        { 
                            name: '💵 New Balance', 
                            value: `${user.coins} coins`, 
                            inline: true 
                        }
                    )
                    .setFooter({ text: 'Come back in 3 minutes to fish again!' })
                    .setTimestamp();

                // Add flavor text based on rarity
                if (!isJunk) {
                    if (caughtItem.rarity === 'Legendary') {
                        embed.addFields({ 
                            name: '🌟 LEGENDARY CATCH!', 
                            value: 'The entire Panfu community will hear about this!', 
                            inline: false 
                        });
                    } else if (caughtItem.rarity === 'Epic') {
                        embed.addFields({ 
                            name: '✨ Epic!', 
                            value: 'What an amazing catch!', 
                            inline: false 
                        });
                    }
                } else if (caughtItem.name === 'Kamaria\'s Lost Sunglasses') {
                    embed.addFields({ 
                        name: '😎 Special Find!', 
                        value: 'Kamaria has been looking for these... she might reward you!', 
                        inline: false 
                    });
                }

                // Send main reply first
                await interaction.reply({ embeds: [embed] });

                // Then check and send achievement notifications as followUp
                if (!isJunk) {
                    try {
                        const { checkAndAwardAchievement } = require('./achievements');
                        
                        const statsResult = await database.pool.query(
                            'SELECT stats FROM discord_users WHERE user_id = $1',
                            [userId]
                        );
                        const currentStats = statsResult.rows[0]?.stats || {};
                        
                        const achievements = [
                            { id: 'fish_1', progress: currentStats.fish_caught || 0 },
                            { id: 'fish_10', progress: currentStats.fish_caught || 0 },
                            { id: 'fish_50', progress: currentStats.fish_caught || 0 },
                            { id: 'fish_100', progress: currentStats.fish_caught || 0 },
                            { id: 'fish_legendary', progress: currentStats.legendary_fish || 0 }
                        ];

                        for (const { id, progress } of achievements) {
                            const unlockedAchievement = await checkAndAwardAchievement(userId, username, id, progress);
                            if (unlockedAchievement) {
                                await interaction.followUp({
                                    embeds: [new EmbedBuilder()
                                        .setColor('#f1c40f')
                                        .setTitle('🏆 Achievement Unlocked!')
                                        .setDescription(`**${unlockedAchievement.name}**\n${unlockedAchievement.description}`)
                                        .addFields(
                                            { name: 'Rewards', value: `+${unlockedAchievement.coins} coins, +${unlockedAchievement.xp} XP`, inline: false }
                                        )
                                        .setTimestamp()]
                                });
                            }
                        }
                    } catch (achievementError) {
                        console.log('Achievement check failed:', achievementError.message);
                    }
                }

                return;
            } catch (error) {
                console.log('Database fishing failed, using JSON fallback:', error.message);
            }
        }

        // JSON fallback
        const userData = loadUserData();
        if (!userData[userId]) {
            userData[userId] = {
                pandaName: username + "'s Panda",
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
                fishCaught: {},
                joinDate: new Date().toISOString()
            };
        }

        userData[userId].coins += coinsEarned;
        
        // Track fish collection
        if (!userData[userId].fishCaught) {
            userData[userId].fishCaught = {};
        }
        if (!isJunk) {
            userData[userId].fishCaught[caughtItem.name] = (userData[userId].fishCaught[caughtItem.name] || 0) + 1;
        }

        saveUserData(userData);

        // Determine color based on rarity
        let embedColor = '#808080';
        if (!isJunk) {
            switch (caughtItem.rarity) {
                case 'Common': embedColor = '#95a5a6'; break;
                case 'Uncommon': embedColor = '#2ecc71'; break;
                case 'Rare': embedColor = '#3498db'; break;
                case 'Epic': embedColor = '#9b59b6'; break;
                case 'Legendary': embedColor = '#f1c40f'; break;
            }
        }

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`${locationData.emoji} Fishing at ${locationData.name}`)
            .setDescription(`*${locationData.description}*\n\n🎣 You cast your line...`)
            .addFields(
                { 
                    name: isJunk ? '🗑️ You caught...' : '🐟 You caught!', 
                    value: `${caughtItem.emoji} **${caughtItem.name}**${isJunk ? '' : ` (${caughtItem.rarity})`}`, 
                    inline: true 
                },
                { 
                    name: '💰 Coins Earned', 
                    value: `+${coinsEarned} coins`, 
                    inline: true 
                },
                { 
                    name: '💵 New Balance', 
                    value: `${userData[userId].coins} coins`, 
                    inline: true 
                }
            )
            .setFooter({ text: 'Come back in 3 minutes to fish again!' })
            .setTimestamp();

        // Add flavor text based on rarity
        if (!isJunk) {
            if (caughtItem.rarity === 'Legendary') {
                embed.addFields({ 
                    name: '🌟 LEGENDARY CATCH!', 
                    value: 'The entire Panfu community will hear about this!', 
                    inline: false 
                });
            } else if (caughtItem.rarity === 'Epic') {
                embed.addFields({ 
                    name: '✨ Epic!', 
                    value: 'What an amazing catch!', 
                    inline: false 
                });
            }
        } else if (caughtItem.name === 'Kamaria\'s Lost Sunglasses') {
            embed.addFields({ 
                name: '😎 Special Find!', 
                value: 'Kamaria has been looking for these... she might reward you!', 
                inline: false 
            });
        }

        return interaction.reply({ embeds: [embed] });
    }
};
