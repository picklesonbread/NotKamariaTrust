const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['commands', 'info'],
    description: 'Show all available commands and features',

    async execute(message, args, client) {
        const subcommand = args[0]?.toLowerCase();

        await interaction.deferReply();

        switch (subcommand) {
            case 'panda':
            case 'profile':
                return this.showPandaHelp(message);

            case 'economy':
            case 'coins':
                return this.showEconomyHelp(message);

            case 'daily':
                return this.showDailyHelp(message);

            case 'mod':
            case 'moderation':
                return this.showModerationHelp(message);

            default:
                return this.showGeneralHelp(message, client);
        }
    },

    showGeneralHelp(message, client) {
        const embed = new EmbedBuilder()
            .setTitle('🐼 Panfu Bot - Help Center')
            .setDescription('Welcome to the magical world of Panfu! Here are all available commands:')
            .setColor('#4a90e2')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {
                    name: '🐼 Panda Profile Commands',
                    value: '`!panda` - View your panda profile\n`!panda customize` - Customize appearance\n`!panda stats` - View detailed statistics\n`!panda rename <name>` - Rename your panda (50 coins)',
                    inline: false
                },
                {
                    name: '🪙 Economy Commands',
                    value: '`!coins` - Check your balance\n`!coins earn` - Work for coins (30min cooldown)\n`!coins give @user <amount>` - Give coins to another user\n`!coins gamble <amount>` - Gamble your coins\n`!coins shop` - View the shop\n`!coins leaderboard` - Top richest pandas',
                    inline: false
                },
                {
                    name: '🌅 Daily Rewards',
                    value: '`!daily` - Claim daily rewards\n`!daily streak` - Check your streak status',
                    inline: false
                },
                {
                    name: '🛡️ Moderation (Staff Only)',
                    value: '`!mod coins @user <amount>` - Give/take coins\n`!mod reset @user` - Reset user profile\n`!mod stats` - Server statistics',
                    inline: false
                },
                {
                    name: '📚 More Help',
                    value: '`!help panda` - Detailed panda commands\n`!help economy` - Economy system details\n`!help daily` - Daily rewards info\n`!help mod` - Moderation commands',
                    inline: false
                }
            )
            .setFooter({ text: 'Made with ❤️ for the Panfu community | Use !panfu or !panda as command prefixes' });

        message.reply({ embeds: [embed] });
    },

    showPandaHelp(message) {
        const embed = new EmbedBuilder()
            .setTitle('🐼 Panda Profile System')
            .setDescription('Create and customize your virtual panda avatar!')
            .setColor('#ff69b4')
            .addFields(
                {
                    name: '📋 Basic Commands',
                    value: '`!panda` or `!panfu` - View your profile\n`!panda stats` - Detailed statistics\n`!panda rename <name>` - Change panda name (costs 50 coins)',
                    inline: false
                },
                {
                    name: '🎨 Customization',
                    value: '`!panda customize` - View customization options\n`!panda customize color <color>` - Change color\n`!panda customize accessory <item>` - Add/remove accessories',
                    inline: false
                },
                {
                    name: '🎨 Available Colors',
                    value: 'classic, brown, white, black, red, blue, green, pink, purple, orange',
                    inline: false
                },
                {
                    name: '👑 Available Accessories',
                    value: 'hat, glasses, bow, scarf, necklace, earrings, crown, mask',
                    inline: false
                },
                {
                    name: '📊 Stats Explained',
                    value: '**Happiness**: Affects daily rewards\n**Energy**: Restored daily, used for activities\n**Friendship**: Increases when interacting with others\n**Level**: Increases with experience points',
                    inline: false
                }
            )
            .setFooter({ text: 'Your panda grows stronger with daily interaction!' });

        message.reply({ embeds: [embed] });
    },

    showEconomyHelp(message) {
        const embed = new EmbedBuilder()
            .setTitle('🪙 Economy System')
            .setDescription('Earn, spend, and trade coins in the Panfu economy!')
            .setColor('#ffd700')
            .addFields(
                {
                    name: '💰 Earning Coins',
                    value: '`!coins earn` - Work for 10-40 coins (30min cooldown)\n`!daily` - Daily rewards (50+ coins)\n`Level up` - Bonus coins when gaining levels\n`Gifts` - Receive coins from other users',
                    inline: false
                },
                {
                    name: '💸 Spending Coins',
                    value: '`Panda rename` - 50 coins\n`Bamboo snacks` - 25 coins (+happiness/energy)\n`Mystery boxes` - 100 coins (random rewards)\n`Premium accessories` - 200 coins',
                    inline: false
                },
                {
                    name: '🎲 Gambling',
                    value: '`!coins gamble <amount>` - Risk coins for potential rewards\n**Win**: 40% chance (1.5x return)\n**Tie**: 30% chance (money back)\n**Lose**: 30% chance (lose bet)\nMinimum bet: 10 coins',
                    inline: false
                },
                {
                    name: '🤝 Trading',
                    value: '`!coins give @user <amount>` - Transfer coins to others\n**Benefits**: Both users gain +2 friendship\n**Note**: Cannot give to bots or yourself',
                    inline: false
                },
                {
                    name: '🏆 Leaderboard',
                    value: '`!coins leaderboard` - See the richest pandas\n**Rankings**: Top 10 users by coin count\n**Rewards**: Bragging rights and community recognition',
                    inline: false
                }
            )
            .setFooter({ text: 'Be wise with your coins - they unlock many features!' });

        message.reply({ embeds: [embed] });
    },

    showDailyHelp(message) {
        const embed = new EmbedBuilder()
            .setTitle('🌅 Daily Reward System')
            .setDescription('Claim rewards every day and build your streak!')
            .setColor('#00ff88')
            .addFields(
                {
                    name: '🎁 Daily Rewards',
                    value: '`!daily` - Claim your daily reward\n**Base reward**: 50 coins + 10 experience\n**Streak bonus**: +5 coins per day (max 100)\n**Energy**: Full restoration\n**Happiness**: +10 points',
                    inline: false
                },
                {
                    name: '🔥 Streak System',
                    value: '**Consecutive days**: Bonus coins increase\n**Missed day**: Streak resets but starts fresh\n**Maximum bonus**: 100 extra coins per day\n**Status**: Check with `!daily streak`',
                    inline: false
                },
                {
                    name: '🏆 Streak Milestones',
                    value: '**Day 7**: +100 bonus coins (weekly)\n**Day 30**: +500 bonus coins (monthly)\n**Every 10 days**: Extra milestone bonus\n**Long streaks**: Increasing rewards',
                    inline: false
                },
                {
                    name: '⏰ Timing',
                    value: '**Reset time**: 24 hours after last claim\n**Grace period**: None - must claim daily\n**Status check**: Use `!daily streak`\n**Next claim**: Shows countdown when claimed',
                    inline: false
                },
                {
                    name: '💡 Tips',
                    value: '• Set a daily reminder to maintain your streak\n• Higher streaks = much better rewards\n• Daily claims also give experience for leveling\n• Energy restoration helps with other activities',
                    inline: false
                }
            )
            .setFooter({ text: 'Consistency is key - daily players get the best rewards!' });

        message.reply({ embeds: [embed] });
    },

    showModerationHelp(message) {
        // Check if user has moderation permissions
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('🚫 You need moderation permissions to view these commands!');
        }

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Moderation Commands')
            .setDescription('Server management tools for staff members')
            .setColor('#ff4444')
            .addFields(
                {
                    name: '🪙 Economy Management',
                    value: '`!mod coins @user <amount>` - Add/remove coins\n`!mod coins @user set <amount>` - Set exact coin amount\n`!mod reset @user economy` - Reset user\'s economy data',
                    inline: false
                },
                {
                    name: '🐼 Profile Management',
                    value: '`!mod reset @user profile` - Reset panda profile\n`!mod reset @user all` - Complete profile reset\n`!mod rename @user <name>` - Force rename panda',
                    inline: false
                },
                {
                    name: '📊 Server Statistics',
                    value: '`!mod stats` - Server activity overview\n`!mod stats economy` - Economy statistics\n`!mod stats users` - User engagement stats',
                    inline: false
                },
                {
                    name: '🔧 Utility Commands',
                    value: '`!mod backup` - Create data backup\n`!mod announce <message>` - Server announcement\n`!mod maintenance` - Toggle maintenance mode',
                    inline: false
                }
            )
            .setFooter({ text: 'Use moderation commands responsibly!' });

        message.reply({ embeds: [embed] });
    }
};
