const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

// Achievement definitions with tiers and rewards
const ACHIEVEMENTS = {
    // Fishing Achievements
    fishing: {
        name: '🎣 Fishing Master',
        achievements: [
            { id: 'fish_1', name: 'First Catch', description: 'Catch your first fish', requirement: 1, coins: 10, xp: 50 },
            { id: 'fish_10', name: 'Amateur Angler', description: 'Catch 10 fish', requirement: 10, coins: 50, xp: 100 },
            { id: 'fish_50', name: 'Skilled Fisher', description: 'Catch 50 fish', requirement: 50, coins: 200, xp: 500 },
            { id: 'fish_100', name: 'Master Angler', description: 'Catch 100 fish', requirement: 100, coins: 500, xp: 1000 },
            { id: 'fish_legendary', name: 'Legendary Hunter', description: 'Catch 5 legendary fish', requirement: 5, coins: 300, xp: 750 }
        ]
    },

    // Exploration Achievements
    exploration: {
        name: '🗺️ Island Explorer',
        achievements: [
            { id: 'explore_1', name: 'First Steps', description: 'Complete your first exploration', requirement: 1, coins: 10, xp: 50 },
            { id: 'explore_10', name: 'Wanderer', description: 'Explore 10 locations', requirement: 10, coins: 50, xp: 100 },
            { id: 'explore_50', name: 'Adventurer', description: 'Explore 50 locations', requirement: 50, coins: 200, xp: 500 },
            { id: 'explore_100', name: 'Island Master', description: 'Explore 100 locations', requirement: 100, coins: 500, xp: 1000 },
            { id: 'explore_all', name: 'Map Completed', description: 'Visit all 10 unique locations', requirement: 10, coins: 300, xp: 750 }
        ]
    },

    // Trivia Achievements
    trivia: {
        name: '🧠 Knowledge Keeper',
        achievements: [
            { id: 'trivia_1', name: 'First Answer', description: 'Answer your first trivia question correctly', requirement: 1, coins: 10, xp: 50 },
            { id: 'trivia_10', name: 'Quiz Enthusiast', description: 'Answer 10 questions correctly', requirement: 10, coins: 50, xp: 100 },
            { id: 'trivia_50', name: 'Trivia Expert', description: 'Answer 50 questions correctly', requirement: 50, coins: 200, xp: 500 },
            { id: 'trivia_100', name: 'Knowledge Master', description: 'Answer 100 questions correctly', requirement: 100, coins: 500, xp: 1000 },
            { id: 'trivia_streak_10', name: 'Streak Master', description: 'Get a 10-question streak', requirement: 10, coins: 300, xp: 750 }
        ]
    },

    // Economy Achievements
    economy: {
        name: '💰 Wealth Accumulator',
        achievements: [
            { id: 'coins_100', name: 'Penny Pincher', description: 'Accumulate 100 coins', requirement: 100, coins: 20, xp: 100 },
            { id: 'coins_1000', name: 'Coin Collector', description: 'Accumulate 1,000 coins', requirement: 1000, coins: 100, xp: 250 },
            { id: 'coins_5000', name: 'Wealthy Panda', description: 'Accumulate 5,000 coins', requirement: 5000, coins: 500, xp: 1000 },
            { id: 'coins_10000', name: 'Tycoon', description: 'Accumulate 10,000 coins', requirement: 10000, coins: 1000, xp: 2000 },
            { id: 'daily_streak_7', name: 'Daily Dedication', description: 'Maintain a 7-day daily streak', requirement: 7, coins: 200, xp: 500 },
            { id: 'daily_streak_30', name: 'Monthly Master', description: 'Maintain a 30-day daily streak', requirement: 30, coins: 1000, xp: 2500 }
        ]
    },

    // Social Achievements
    social: {
        name: '👥 Social Butterfly',
        achievements: [
            { id: 'friend_1', name: 'First Friend', description: 'Reach friendship level 2 with someone', requirement: 1, coins: 25, xp: 100 },
            { id: 'friend_5', name: 'Popular Panda', description: 'Have 5 friendship bonds', requirement: 5, coins: 100, xp: 250 },
            { id: 'friend_legendary', name: 'Legendary Bond', description: 'Reach max friendship with someone', requirement: 1, coins: 500, xp: 1000 }
        ]
    },

    // Quest Achievements
    quests: {
        name: '⚔️ Quest Champion',
        achievements: [
            { id: 'quest_1', name: 'Quest Beginner', description: 'Complete your first quest', requirement: 1, coins: 25, xp: 100 },
            { id: 'quest_5', name: 'Quest Adventurer', description: 'Complete 5 quests', requirement: 5, coins: 100, xp: 250 },
            { id: 'quest_10', name: 'Quest Hero', description: 'Complete 10 quests', requirement: 10, coins: 250, xp: 500 },
            { id: 'quest_25', name: 'Quest Legend', description: 'Complete 25 quests', requirement: 25, coins: 750, xp: 1500 }
        ]
    },

    // Level Achievements
    levels: {
        name: '⭐ Level Progression',
        achievements: [
            { id: 'level_5', name: 'Novice Panda', description: 'Reach level 5', requirement: 5, coins: 50, xp: 0 },
            { id: 'level_10', name: 'Experienced Panda', description: 'Reach level 10', requirement: 10, coins: 100, xp: 0 },
            { id: 'level_25', name: 'Veteran Panda', description: 'Reach level 25', requirement: 25, coins: 500, xp: 0 },
            { id: 'level_50', name: 'Elite Panda', description: 'Reach level 50', requirement: 50, coins: 1500, xp: 0 },
            { id: 'level_100', name: 'Legendary Panda', description: 'Reach level 100', requirement: 100, coins: 5000, xp: 0 }
        ]
    },

    // Special Achievements
    special: {
        name: '🌟 Special Badges',
        achievements: [
            { id: 'first_day', name: 'Day One Pioneer', description: 'Join the server', requirement: 1, coins: 50, xp: 100 },
            { id: 'volcano_escape', name: 'Lava Survivor', description: 'Successfully escape the volcano', requirement: 1, coins: 100, xp: 200 },
            { id: 'banana_winner', name: 'Banana Gambler', description: 'Win 10 banana bets', requirement: 10, coins: 200, xp: 400 },
            { id: 'mystery_solver', name: 'Detective', description: 'Solve 5 mysteries', requirement: 5, coins: 150, xp: 300 }
        ]
    }
};

// Helper function to get all achievements as a flat list
function getAllAchievements() {
    const all = [];
    for (const category in ACHIEVEMENTS) {
        for (const achievement of ACHIEVEMENTS[category].achievements) {
            all.push({ ...achievement, category });
        }
    }
    return all;
}

// Helper function to check and award achievement
async function checkAndAwardAchievement(userId, username, achievementId, currentProgress) {
    try {
        if (!database || !database.isInitialized()) {
            return null;
        }

        // Find the achievement
        const allAchievements = getAllAchievements();
        const achievement = allAchievements.find(a => a.id === achievementId);
        
        if (!achievement) return null;

        // Get user's achievements
        const result = await database.pool.query(
            'SELECT achievements FROM discord_users WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) return null;

        const userAchievements = result.rows[0].achievements || {};

        // Check if already unlocked
        if (userAchievements[achievementId]) {
            return null;
        }

        // Check if requirement is met
        if (currentProgress >= achievement.requirement) {
            // Award achievement
            userAchievements[achievementId] = {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                progress: currentProgress
            };

            // Update database
            await database.pool.query(
                'UPDATE discord_users SET achievements = $1 WHERE user_id = $2',
                [JSON.stringify(userAchievements), userId]
            );

            // Award rewards
            if (achievement.coins > 0) {
                await database.updateUserCoins(userId, achievement.coins);
            }
            if (achievement.xp > 0) {
                await database.addUserXP(userId, achievement.xp);
            }

            return achievement;
        }

        return null;
    } catch (error) {
        console.error('Error checking achievement:', error);
        return null;
    }
}

// Export the function for use in other commands
module.exports.checkAndAwardAchievement = checkAndAwardAchievement;
module.exports.ACHIEVEMENTS = ACHIEVEMENTS;

module.exports = {
    name: 'achievements',
    description: 'View and track your achievement progress!',

    data: new SlashCommandBuilder()
        .setName('achievements')
        .setDescription('View and track your achievement progress!')
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('View all your achievements')
        )
        .addSubcommand(sub =>
            sub.setName('category')
                .setDescription('View achievements by category')
                .addStringOption(opt =>
                    opt.setName('category')
                        .setDescription('Achievement category')
                        .setRequired(true)
                        .addChoices(
                            { name: '🎣 Fishing Master', value: 'fishing' },
                            { name: '🗺️ Island Explorer', value: 'exploration' },
                            { name: '🧠 Knowledge Keeper', value: 'trivia' },
                            { name: '💰 Wealth Accumulator', value: 'economy' },
                            { name: '👥 Social Butterfly', value: 'social' },
                            { name: '⚔️ Quest Champion', value: 'quests' },
                            { name: '⭐ Level Progression', value: 'levels' },
                            { name: '🌟 Special Badges', value: 'special' }
                        )
                )
        )
        .addSubcommand(sub =>
            sub.setName('progress')
                .setDescription('View your current progress on achievements')
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const subcommand = interaction.options.getSubcommand();

        if (database && database.isInitialized()) {
            try {
                // Get user profile with achievements
                const result = await database.pool.query(
                    'SELECT achievements, coins, level, experience FROM discord_users WHERE user_id = $1',
                    [userId]
                );

                let userAchievements = {};
                let userCoins = 0;
                let userLevel = 1;

                if (result.rows.length > 0) {
                    userAchievements = result.rows[0].achievements || {};
                    userCoins = result.rows[0].coins || 0;
                    userLevel = result.rows[0].level || 1;
                } else {
                    // Create user profile
                    await database.getUserProfile(userId, username);
                }

                if (subcommand === 'list') {
                    // Count total unlocked achievements
                    const totalUnlocked = Object.values(userAchievements).filter(a => a.unlocked).length;
                    const totalAchievements = getAllAchievements().length;
                    const completionPercent = Math.round((totalUnlocked / totalAchievements) * 100);

                    const embed = new EmbedBuilder()
                        .setColor('#f1c40f')
                        .setTitle(`🏆 ${username}'s Achievements`)
                        .setDescription(`**Progress:** ${totalUnlocked}/${totalAchievements} (${completionPercent}%)`)
                        .setFooter({ text: 'Use /achievements category to view specific categories!' })
                        .setTimestamp();

                    // Show achievements by category
                    for (const [categoryKey, category] of Object.entries(ACHIEVEMENTS)) {
                        const categoryAchievements = category.achievements;
                        const unlockedInCategory = categoryAchievements.filter(a => 
                            userAchievements[a.id]?.unlocked
                        ).length;

                        embed.addFields({
                            name: category.name,
                            value: `${unlockedInCategory}/${categoryAchievements.length} unlocked`,
                            inline: true
                        });
                    }

                    return interaction.reply({ embeds: [embed] });
                }

                if (subcommand === 'category') {
                    const categoryKey = interaction.options.getString('category');
                    const category = ACHIEVEMENTS[categoryKey];

                    if (!category) {
                        return interaction.reply({ content: 'Invalid category!', ephemeral: true });
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setTitle(category.name)
                        .setDescription('Track your progress and unlock rewards!')
                        .setTimestamp();

                    for (const achievement of category.achievements) {
                        const isUnlocked = userAchievements[achievement.id]?.unlocked;
                        const icon = isUnlocked ? '✅' : '🔒';
                        const rewards = [];
                        
                        if (achievement.coins > 0) rewards.push(`${achievement.coins} coins`);
                        if (achievement.xp > 0) rewards.push(`${achievement.xp} XP`);

                        embed.addFields({
                            name: `${icon} ${achievement.name}`,
                            value: `${achievement.description}\n**Requirement:** ${achievement.requirement}\n**Rewards:** ${rewards.join(', ')}`,
                            inline: false
                        });
                    }

                    return interaction.reply({ embeds: [embed] });
                }

                if (subcommand === 'progress') {
                    // Get user stats from database
                    const statsResult = await database.pool.query(
                        'SELECT stats FROM discord_users WHERE user_id = $1',
                        [userId]
                    );

                    const stats = statsResult.rows[0]?.stats || {
                        fish_caught: 0,
                        explorations: 0,
                        trivia_correct: 0,
                        quests_completed: 0,
                        volcano_escapes: 0,
                        banana_wins: 0,
                        mysteries_solved: 0
                    };

                    const embed = new EmbedBuilder()
                        .setColor('#9b59b6')
                        .setTitle(`📊 ${username}'s Achievement Progress`)
                        .setDescription('Your current progress towards achievements')
                        .addFields(
                            { name: '🎣 Fish Caught', value: `${stats.fish_caught || 0}`, inline: true },
                            { name: '🗺️ Explorations', value: `${stats.explorations || 0}`, inline: true },
                            { name: '🧠 Trivia Correct', value: `${stats.trivia_correct || 0}`, inline: true },
                            { name: '⚔️ Quests Completed', value: `${stats.quests_completed || 0}`, inline: true },
                            { name: '💰 Current Coins', value: `${userCoins}`, inline: true },
                            { name: '⭐ Current Level', value: `${userLevel}`, inline: true }
                        )
                        .setFooter({ text: 'Keep playing to unlock more achievements!' })
                        .setTimestamp();

                    return interaction.reply({ embeds: [embed] });
                }

            } catch (error) {
                console.error('Database achievement error:', error);
            }
        }

        // JSON fallback
        return interaction.reply({ 
            content: 'Achievement system requires database connection!', 
            ephemeral: true 
        });
    },

    checkAndAwardAchievement,
    ACHIEVEMENTS
};
