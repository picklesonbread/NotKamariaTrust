const { EmbedBuilder } = require('discord.js');
const database = require('../utils/database');
const { getUserProfile } = require('../utils/storage');

module.exports = {
    name: 'level',
    aliases: ['lvl', 'xp', 'rank'],
    description: 'Check your current level, XP, and progress to the next level',
    usage: 'level [user]',

    async execute(message, args, client) {
        try {
            // Get target user (mentioned user or message author)
            let targetUser = message.author;
            if (args.length > 0 && message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            }

            let userProfile;
            let usingDatabase = false;

            // Try database first if available
            if (database) {
                try {
                    userProfile = await database.getUserProfile(targetUser.id, targetUser.username);
                    if (userProfile) {
                        usingDatabase = true;
                    }
                } catch (error) {
                    console.log('Database error, falling back to JSON storage:', error.message);
                }
            }

            // Fall back to JSON storage if database failed or unavailable
            if (!userProfile) {
                userProfile = getUserProfile(targetUser.id, targetUser.username);
                usingDatabase = false;
            }

            const currentLevel = userProfile.level || 1;
            const currentXP = userProfile.experience || 0;
            // Handle both database (total_messages) and JSON storage format
            const totalMessages = userProfile.total_messages || 0;

            // Calculate XP needed for next level
            let xpForCurrentLevel, xpForNextLevel, xpNeeded, progressPercent;

            if (usingDatabase) {
                xpForCurrentLevel = database.calculateXPForLevel(currentLevel);
                xpForNextLevel = database.calculateXPForLevel(currentLevel + 1);
                xpNeeded = xpForNextLevel - currentXP;
                const xpInCurrentLevel = currentXP - xpForCurrentLevel;
                const xpRequiredForLevel = xpForNextLevel - xpForCurrentLevel;
                progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForLevel) * 100));
            } else {
                // Simple calculation for JSON storage
                xpForNextLevel = currentLevel * 100;
                xpNeeded = Math.max(0, xpForNextLevel - currentXP);
                progressPercent = Math.min(100, (currentXP / xpForNextLevel) * 100);
            }

            // Create progress bar
            const progressBarLength = 20;
            const filledLength = Math.floor((progressPercent / 100) * progressBarLength);
            const progressBar = '█'.repeat(filledLength) + '░'.repeat(progressBarLength - filledLength);

            // Determine level title based on current level
            let levelTitle = '𝔫𝔢𝔴𝔟𝔦𝔢◡̈';
            if (currentLevel >= 100) levelTitle = '𝔩𝔢𝔤𝔢𝔫𝔡𝔞𝔯𝔶 𝔰𝔢𝔯𝔳𝔢𝔯 𝔤𝔯𝔞𝔫𝔡𝔭𝔞𖣂𓀗';
            else if (currentLevel >= 50) levelTitle = '𝔪𝔞𝔰𝔱𝔢𝔯 𝔱𝔶𝔭𝔬 𝔢𝔫𝔱𝔥𝔲𝔰𝔦𝔞𝔰𝔱☠︎';
            else if (currentLevel >= 20) levelTitle = '𝔢𝔵𝔭𝔢𝔯𝔱 𝔟𝔞𝔪𝔟𝔬𝔬 𝔥𝔬𝔞𝔯𝔡𝔢𝔯•ﻌ•';
            else if (currentLevel >= 10) levelTitle = '︎𝔰k𝔦𝔩𝔩𝔢𝔡 𝔭𝔦𝔫𝔤 𝔡𝔬𝔡𝔤𝔢𝔯🤺';
            else if (currentLevel >= 5) levelTitle = '𝔯𝔦𝔰𝔦𝔫𝔤 𝔰𝔢𝔯𝔳𝔢𝔯 𝔩𝔦𝔞𝔟𝔦𝔩𝔦𝔱𝔶 ོ☼𓂃';

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('📊 Level Progress')
                .setAuthor({ 
                    name: targetUser.username, 
                    iconURL: targetUser.displayAvatarURL({ dynamic: true }) 
                })
                .addFields(
                    { 
                        name: '🏆 Current Level', 
                        value: `**Level ${currentLevel}**\n*${levelTitle}*`, 
                        inline: true 
                    },
                    { 
                        name: '✨ Total XP', 
                        value: `${currentXP.toLocaleString()} XP`, 
                        inline: true 
                    },
                    { 
                        name: '📈 Messages Sent', 
                        value: `${totalMessages.toLocaleString()}`, 
                        inline: true 
                    },
                    {
                        name: '🎯 Progress to Next Level',
                        value: `${progressBar}\n**${progressPercent.toFixed(1)}%** complete\n${xpNeeded.toLocaleString()} XP needed for Level ${currentLevel + 1}`,
                        inline: false
                    }
                )
                .setFooter({ 
                    text: 'Send messages to gain XP! (Cooldown: 60 seconds)', 
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            // Add different color based on level
            if (currentLevel >= 50) embed.setColor(0xffd700); // Gold
            else if (currentLevel >= 20) embed.setColor(0x9932cc); // Purple
            else if (currentLevel >= 10) embed.setColor(0x1e90ff); // Blue
            else if (currentLevel >= 5) embed.setColor(0x32cd32); // Green
            else embed.setColor(0x808080); // Gray for newbies

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in level command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Error')
                .setDescription('There was an error checking your level! Please try again later.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
};
