const { EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');

// Import database utilities  
const database = require('../utils/database');

module.exports = {
    name: 'daily',
    aliases: ['checkin', 'reward'],
    description: 'Claim your daily rewards and check streak',

    async execute(message, args, client) {
        const userId = message.author.id;


        const subcommand = args[0]?.toLowerCase();

        switch (subcommand) {
            case 'streak':
            case 'status':
                return this.showDailyStatus(message, userId);

            case 'claim':
            default:
                return this.claimDaily(message, userId);
        }
    },

    async claimDaily(message, userId) {
        let storage = (database && database.isInitialized()) ? 'db' : 'json';
        let user;

        if (storage === 'db') {
            try {
                user = await database.getUserProfile(userId, message.author.username);
                if (!user) throw new Error('Database unavailable');
            } catch (error) {
                console.log('Database error, falling back to JSON storage:', error.message);
                storage = 'json';
            }
        }

        if (storage === 'json') {
            // Use JSON storage fallback
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
                    dailyStreak: 0,
                    joinDate: new Date().toISOString()
                };
                saveUserData(userData);
            }
            user = userData[userId];
        }

        const now = new Date();
        const lastDaily = user.last_daily ? new Date(user.last_daily) : (user.lastDaily ? new Date(user.lastDaily) : null);

        // Check if user has already claimed today
        if (lastDaily && this.isSameDay(now, lastDaily)) {
            const nextDaily = new Date(lastDaily);
            nextDaily.setDate(nextDaily.getDate() + 1);
            const timeUntilNext = Math.ceil((nextDaily - now) / (1000 * 60 * 60));

            const alreadyClaimedEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('🕐 Daily Reward Already Claimed')
                .setDescription(`You've already claimed your daily reward! Come back in **${timeUntilNext} hours**.`)
                .setFooter({ text: 'Daily rewards reset at midnight UTC' })
                .setTimestamp();

            return message.reply({ embeds: [alreadyClaimedEmbed] });
        }

        // Check streak
        let streak = user.daily_streak || user.dailyStreak || 0;
        if (lastDaily && this.isConsecutiveDay(now, lastDaily)) {
            streak++;
        } else if (lastDaily && !this.isConsecutiveDay(now, lastDaily)) {
            streak = 1; // Reset streak but start new one
        } else {
            streak = 1; // First time claiming
        }

        // Calculate rewards based on streak
        const baseCoins = 50;
        const streakBonus = Math.min(streak * 5, 100); // Max 100 bonus coins
        const totalCoins = baseCoins + streakBonus;
        const expReward = 10 + Math.min(streak, 20); // 10-30 exp

        // Get current stats
        const currentStats = user.stats || {
            friendship: 50,
            energy: 100,
            happiness: 75,
            bamboo_eaten: 0,
            games_played: 0,
            days_active: 1
        };

        // Update stats
        const updatedStats = {
            ...currentStats,
            happiness: Math.min(100, currentStats.happiness + 10),
            energy: 100,
            days_active: currentStats.days_active + 1
        };

        // Special streak rewards
        let bonusCoins = 0;
        let specialReward = '';
        if (streak === 7) {
            bonusCoins = 100;
            specialReward = '\n🎁 **Weekly Bonus**: +100 coins!';
        } else if (streak === 30) {
            bonusCoins = 500;
            specialReward = '\n🏆 **Monthly Bonus**: +500 coins!';
        } else if (streak % 10 === 0) {
            bonusCoins = streak * 2;
            specialReward = `\n✨ **Streak Milestone**: +${streak * 2} coins!`;
        }

        const finalCoins = totalCoins + bonusCoins;

        if (storage === 'db') {
            try {
                // First update coins, streak, and stats
                const success = await database.updateUserProfile(userId, {
                    coins: user.coins + finalCoins,
                    daily_streak: streak,
                    last_daily: now.toISOString(),
                    stats: updatedStats
                });

                if (!success) throw new Error('Database update failed');

                // Then add XP using centralized system (handles level-up automatically)
                const xpResult = await database.addUserXP(userId, expReward, message.guild?.id);
                
                // Get updated user data
                const updatedUser = await database.getUserProfile(userId, message.author.username);
                if (updatedUser) {
                    user = updatedUser;
                } else {
                    throw new Error('Failed to retrieve updated user');
                }

                // If user leveled up, send notification
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
                // Fall back to JSON storage
                const userData = loadUserData();
                if (!userData[userId]) {
                    userData[userId] = {
                        pandaName: message.author.username + "'s Panda",
                        color: 'classic',
                        accessories: [],
                        coins: user.coins || 100,
                        level: user.level || 1,
                        experience: user.experience || 0,
                        stats: user.stats || { friendship: 50, energy: 100, happiness: 75, bamboo_eaten: 0, games_played: 0, days_active: 1 },
                        lastDaily: null,
                        dailyStreak: user.daily_streak || user.dailyStreak || 0,
                        joinDate: new Date().toISOString()
                    };
                }
                
                // Calculate level before adding XP
                const oldLevel = database ? database.calculateLevelFromXP(userData[userId].experience) : userData[userId].level;
                
                // Add rewards
                userData[userId].coins += finalCoins;
                userData[userId].experience += expReward;
                userData[userId].dailyStreak = streak;
                userData[userId].lastDaily = now.toISOString();
                userData[userId].stats = updatedStats;
                
                // Calculate new level after adding XP
                const newLevel = database ? database.calculateLevelFromXP(userData[userId].experience) : oldLevel;
                const leveledUp = newLevel > oldLevel;
                
                // Update level in user data
                userData[userId].level = newLevel;
                
                saveUserData(userData);
                user = userData[userId];
                
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
        } else {
            // Update JSON storage
            const userData = loadUserData();
            
            // Calculate level before adding XP
            const oldLevel = database ? database.calculateLevelFromXP(userData[userId].experience) : userData[userId].level;
            
            // Add rewards
            userData[userId].coins += finalCoins;
            userData[userId].experience += expReward;
            userData[userId].dailyStreak = streak;
            userData[userId].lastDaily = now.toISOString();
            userData[userId].stats = updatedStats;
            
            // Calculate new level after adding XP
            const newLevel = database ? database.calculateLevelFromXP(userData[userId].experience) : oldLevel;
            const leveledUp = newLevel > oldLevel;
            
            // Update level in user data
            userData[userId].level = newLevel;
            
            saveUserData(userData);
            user = userData[userId];
            
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

        // Create reward embed
        const embed = new EmbedBuilder()
            .setTitle('🌅 Daily Check-in Successful!')
            .setDescription(`Welcome back to Panfu, ${message.author.username}'s Panda! 🐼${specialReward}`)
            .setColor('#4a90e2')
            .addFields(
                { name: '🪙 Coins Earned', value: `${finalCoins} (${baseCoins} base + ${streakBonus} streak${bonusCoins > 0 ? ` + ${bonusCoins} bonus` : ''})`, inline: true },
                { name: '💫 Experience', value: `+${expReward} XP`, inline: true },
                { name: '🔥 Daily Streak', value: `${streak} days`, inline: true },
                { name: '💰 New Balance', value: user.coins.toString(), inline: true },
                { name: '⚡ Energy', value: '100/100 (Restored!)', inline: true },
                { name: '❤️ Happiness', value: `${updatedStats.happiness}/100`, inline: true }
            )
            .setFooter({ text: 'Come back tomorrow for more rewards!' });

        // Add streak milestone information
        if (streak < 7) {
            embed.addFields({ name: '🎯 Next Milestone', value: `${7 - streak} days until weekly bonus!`, inline: false });
        } else if (streak < 30) {
            embed.addFields({ name: '🎯 Next Milestone', value: `${30 - streak} days until monthly bonus!`, inline: false });
        }

        message.reply({ embeds: [embed] });
    },

    async showDailyStatus(message, userId) {
        let user;

        let storage = (database && database.isInitialized()) ? 'db' : 'json';

        if (storage === 'db') {
            try {
                user = await database.getUserProfile(userId, message.author.username);
                if (!user) throw new Error('Database unavailable');
            } catch (error) {
                console.log('Database error, falling back to JSON storage:', error.message);
                storage = 'json';
            }
        }

        if (storage === 'json') {
            // Use JSON storage fallback
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
                    dailyStreak: 0,
                    joinDate: new Date().toISOString()
                };
                saveUserData(userData);
            }
            user = userData[userId];
        }

        const now = new Date();
        const lastDaily = user.last_daily ? new Date(user.last_daily) : (user.lastDaily ? new Date(user.lastDaily) : null);
        const streak = user.daily_streak || user.dailyStreak || 0;

        let status = '';
        let nextReward = '';

        if (!lastDaily) {
            status = '❌ Not claimed yet';
            nextReward = 'Available now!';
        } else if (this.isSameDay(now, lastDaily)) {
            status = '✅ Already claimed today';
            const nextDaily = new Date(lastDaily);
            nextDaily.setDate(nextDaily.getDate() + 1);
            const hours = Math.ceil((nextDaily - now) / (1000 * 60 * 60));
            nextReward = `Available in ${hours} hours`;
        } else {
            status = '⏰ Ready to claim!';
            nextReward = 'Available now!';
        }

        const baseCoins = 50;
        const streakBonus = Math.min((streak + 1) * 5, 100);
        const totalCoins = baseCoins + streakBonus;

        const currentStats = user.stats || {
            friendship: 50,
            energy: 100,
            happiness: 75,
            bamboo_eaten: 0,
            games_played: 0,
            days_active: 1
        };

        const embed = new EmbedBuilder()
            .setTitle('📅 Daily Reward Status')
            .setColor('#ffd700')
            .addFields(
                { name: '📊 Current Status', value: status, inline: true },
                { name: '🔥 Current Streak', value: `${streak} days`, inline: true },
                { name: '⏰ Next Reward', value: nextReward, inline: true },
                { name: '🪙 Next Reward Amount', value: `${totalCoins} coins (${baseCoins} + ${streakBonus} streak bonus)`, inline: false },
                { name: '📈 Days Active', value: currentStats.days_active.toString(), inline: true }
            )
            .setFooter({ text: 'Use !daily to claim your reward!' });

        // Add streak milestones
        let milestones = '';
        if (streak < 7) milestones += `🎁 Day 7: +100 bonus coins\n`;
        if (streak < 30) milestones += `🏆 Day 30: +500 bonus coins\n`;
        milestones += `✨ Every 10 days: Extra streak bonus!`;

        embed.addFields({ name: '🎯 Upcoming Milestones', value: milestones, inline: false });

        message.reply({ embeds: [embed] });
    },

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },

    isConsecutiveDay(date1, date2) {
        // Create dates at midnight to compare calendar days, not exact time
        const day1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const day2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
        
        // Calculate difference in calendar days
        const dayDiff = Math.floor((day1 - day2) / (1000 * 60 * 60 * 24));
        return dayDiff === 1;
    }
};
