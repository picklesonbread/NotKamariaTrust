const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

// Mystery scenarios with clues and solutions
const mysteries = [
    {
        title: "The Case of the Missing Bamboo",
        description: "Someone's been stealing bamboo from the jungle! Fresh paw prints lead toward the castle...",
        clues: ["muddy paws", "castle direction", "missing bamboo"],
        solution: "farid",
        reward: 15
    },
    {
        title: "The Lighthouse Light Mystery", 
        description: "The lighthouse keeps flickering strange morse code patterns. Pandas are getting lost at sea!",
        clues: ["morse code", "lighthouse keeper", "pattern SOS"],
        solution: "kamaria",
        reward: 20
    },
    {
        title: "The Disco Dome Sabotage",
        description: "The disco ball shattered during peak dance hours. Security footage shows a suspicious hooded figure...",
        clues: ["hooded figure", "dance rivalry", "jealousy"],
        solution: "ella",
        reward: 12
    },
    {
        title: "The Swamp of Sadness Curse",
        description: "Pandas keep getting stuck in the swamp longer than usual. Strange bubbles appear at midnight...",
        clues: ["midnight bubbles", "magic spell", "ancient curse"],
        solution: "ghost",
        reward: 18
    },
    {
        title: "The Dojo Uniform Thief",
        description: "All the karate uniforms went missing before the big tournament. Only purple belts remain...",
        clues: ["purple belts", "tournament sabotage", "rival dojo"],
        solution: "ninja",
        reward: 14
    }
];

// Store active mysteries per channel
const activeMysteries = new Map();

module.exports = {
    name: 'mystery',
    aliases: ['investigate', 'solve'],
    description: 'Solve mysterious cases happening around Panfu island',

    data: new SlashCommandBuilder()
        .setName('mystery')
        .setDescription('Solve mysterious cases happening around Panfu island')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Start investigating a new mystery')
        )
        .addSubcommand(sub =>
            sub.setName('clue')
                .setDescription('Get a clue for the current mystery')
        )
        .addSubcommand(sub =>
            sub.setName('solve')
                .setDescription('Attempt to solve the mystery')
                .addStringOption(opt =>
                    opt.setName('suspect')
                        .setDescription('Who do you think is responsible?')
                        .setRequired(true)
                )
        ),

    async execute(message, args, client) {
        const channelId = message.channel.id;
        const subcommand = args[0] || 'start';

        switch (subcommand) {
            case 'start':
                const mystery = mysteries[Math.floor(Math.random() * mysteries.length)];
                activeMysteries.set(channelId, { 
                    ...mystery, 
                    cluesRevealed: 0, 
                    startTime: Date.now(),
                    participants: new Set()
                });

                const startEmbed = new EmbedBuilder()
                    .setTitle(`🔍 ${mystery.title}`)
                    .setColor(0x9b59b6)
                    .setDescription(
                        `${mystery.description}\n\n` +
                        `**Investigation Commands:**\n` +
                        `• \`/mystery clue\` - Get investigation clues\n` +
                        `• \`/mystery solve suspect:[name]\` - Solve the case\n\n` +
                        `**Reward:** ${mystery.reward} coins for solving`
                    )
                    .setFooter({ text: "The investigation begins..." });

                return message.reply({ embeds: [startEmbed] });

            case 'clue':
                const activeMystery = activeMysteries.get(channelId);
                if (!activeMystery) {
                    return message.reply("🕵️ No active mystery! Use `/mystery start` to begin investigating.");
                }

                if (activeMystery.cluesRevealed >= activeMystery.clues.length) {
                    return message.reply("🔍 You've uncovered all available clues! Time to solve the mystery.");
                }

                const clue = activeMystery.clues[activeMystery.cluesRevealed];
                activeMystery.cluesRevealed++;
                activeMystery.participants.add(message.author.id);

                const clueEmbed = new EmbedBuilder()
                    .setTitle(`🔍 Clue #${activeMystery.cluesRevealed}`)
                    .setColor(0x3498db)
                    .setDescription(`**Evidence Found:** ${clue}`)
                    .setFooter({ text: `${activeMystery.clues.length - activeMystery.cluesRevealed} clues remaining` });

                return message.reply({ embeds: [clueEmbed] });

            case 'solve':
                const currentMystery = activeMysteries.get(channelId);
                if (!currentMystery) {
                    return message.reply("🕵️ No active mystery to solve! Start one with `/mystery start`.");
                }

                const suspect = args[1]?.toLowerCase();
                if (!suspect) {
                    return message.reply("🤔 Who do you suspect? Use `/mystery solve suspect:[name]`");
                }

                const userData = loadUserData();
                const userId = message.author.id;

                if (!userData[userId]) {
                    userData[userId] = {
                        panda: {
                            name: `${message.author.username}'s Panda`,
                            color: 'Black & White',
                            accessories: 'None'
                        },
                        coins: 50,
                        level: 1,
                        experience: 0,
                        stats: {
                            friendship: 10,
                            energy: 100,
                            happiness: 75
                        },
                        daily: {
                            lastClaimed: null,
                            streak: 0
                        },
                        joinedAt: new Date().toISOString(),
                        mysteries: { solved: 0, failed: 0 }
                    };
                }

                if (!userData[userId].mysteries) {
                    userData[userId].mysteries = { solved: 0, failed: 0 };
                }

                const isCorrect = suspect === currentMystery.solution;

                if (isCorrect) {
                    let newBalance = 0;
                    let solved = 0;
                    let failed = 0;

                    // Try database first
                    if (database && database.isInitialized()) {
                        try {
                            await database.getUserProfile(userId, message.author.username);
                            await database.updateUserCoins(userId, currentMystery.reward);
                            const updatedUser = await database.getUserProfile(userId, message.author.username);
                            newBalance = updatedUser.coins;
                            
                            // TODO: Mystery tracking (solved/failed) is not yet stored in database
                            // For now, these stats are only tracked in JSON mode
                            // Future enhancement: Add mystery_stats JSONB column to users table
                            solved = (updatedUser.mysteries?.solved || 0) + 1;
                            failed = updatedUser.mysteries?.failed || 0;
                            
                            const successEmbed = new EmbedBuilder()
                                .setTitle("🎉 Mystery Solved!")
                                .setColor(0x2ecc71)
                                .setDescription(
                                    `**${message.author.username}** cracked the case!\n\n` +
                                    `**The culprit was:** ${currentMystery.solution}\n` +
                                    `**Reward:** ${currentMystery.reward} coins\n` +
                                    `**Total Balance:** ${newBalance} coins\n\n` +
                                    `**Detective Stats:** ${solved} solved, ${failed} failed`
                                );

                            activeMysteries.delete(channelId);
                            return message.reply({ embeds: [successEmbed] });
                        } catch (error) {
                            console.log('Database failed for mystery reward, using JSON fallback:', error.message);
                        }
                    }

                    // JSON fallback
                    userData[userId].coins += currentMystery.reward;
                    userData[userId].mysteries.solved++;
                    saveUserData(userData);

                    const successEmbed = new EmbedBuilder()
                        .setTitle("🎉 Mystery Solved!")
                        .setColor(0x2ecc71)
                        .setDescription(
                            `**${message.author.username}** cracked the case!\n\n` +
                            `**The culprit was:** ${currentMystery.solution}\n` +
                            `**Reward:** ${currentMystery.reward} coins\n` +
                            `**Total Balance:** ${userData[userId].coins} coins\n\n` +
                            `**Detective Stats:** ${userData[userId].mysteries.solved} solved, ${userData[userId].mysteries.failed} failed`
                        );

                    activeMysteries.delete(channelId);
                    return message.reply({ embeds: [successEmbed] });
                } else {
                    // For failed attempts, just update JSON for now
                    userData[userId].mysteries.failed++;
                    saveUserData(userData);

                    return message.reply(
                        `❌ **Wrong suspect!** ${suspect} has an alibi. The mystery continues...\n` +
                        `**Detective Stats:** ${userData[userId].mysteries.solved} solved, ${userData[userId].mysteries.failed} failed`
                    );
                }

            default:
                return message.reply("🔍 Use `start`, `clue`, or `solve [suspect]` with the mystery command!");
        }
    }
};
