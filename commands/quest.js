const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');

// Import database utilities
const database = require('../utils/database');

// Multi-step quests
const quests = [
    {
        id: "bamboo_delivery",
        title: "The Great Bamboo Delivery",
        description: "Kamaria needs bamboo delivered across the island before the pandas revolt!",
        steps: [
            { step: 1, description: "Visit the Jungle to collect fresh bamboo", action: "collect", reward: 5 },
            { step: 2, description: "Transport bamboo through the Swamp of Sadness", action: "transport", reward: 8 },
            { step: 3, description: "Deliver to Kamaria at the Castle", action: "deliver", reward: 15 }
        ],
        totalReward: 28
    },
    {
        id: "lighthouse_repair", 
        title: "Lighthouse Emergency Repair",
        description: "The lighthouse is broken and pandas are getting lost at sea!",
        steps: [
            { step: 1, description: "Gather repair tools from the Dojo", action: "gather", reward: 6 },
            { step: 2, description: "Climb the treacherous lighthouse stairs", action: "climb", reward: 10 },
            { step: 3, description: "Fix the broken light mechanism", action: "repair", reward: 12 }
        ],
        totalReward: 28
    },
    {
        id: "disco_heist",
        title: "The Disco Ball Heist Investigation", 
        description: "Someone stole the disco ball! The pandas can't dance without it!",
        steps: [
            { step: 1, description: "Search for clues at the Disco Dome", action: "search", reward: 7 },
            { step: 2, description: "Question suspicious pandas at the Beach", action: "question", reward: 9 },
            { step: 3, description: "Confront the thief at the Volcano", action: "confront", reward: 14 }
        ],
        totalReward: 30
    },
    {
        id: "volcano_expedition",
        title: "Volcano Treasure Expedition",
        description: "Ancient treasure lies deep within the volcano's caves!",
        steps: [
            { step: 1, description: "Prepare heat-resistant gear", action: "prepare", reward: 8 },
            { step: 2, description: "Navigate the lava tunnels", action: "navigate", reward: 12 },
            { step: 3, description: "Defeat the Guardian of the Treasure", action: "battle", reward: 18 }
        ],
        totalReward: 38
    }
];

// Helper functions for persistent quest storage
async function getUserActiveQuest(userId, username) {
    let usingDatabase = !!(database && database.isInitialized());

    if (usingDatabase) {
        // Try to get quest from database
        try {
            const user = await database.getUserProfile(userId, username);
            return user?.active_quest || null;
        } catch (error) {
            console.error('Database error, falling back to JSON:', error);
            usingDatabase = false;
        }
    }

    if (!usingDatabase) {
        // Fall back to JSON storage
        const userData = loadUserData();
        return userData[userId]?.activeQuest || null;
    }
}

async function saveUserActiveQuest(userId, username, questData) {
    let usingDatabase = !!(database && database.isInitialized());

    if (usingDatabase) {
        // Try to save quest to database
        try {
            await database.updateUserProfile(userId, { active_quest: questData });
            return;
        } catch (error) {
            console.error('Database error, falling back to JSON:', error);
            usingDatabase = false;
        }
    }

    if (!usingDatabase) {
        // Fall back to JSON storage
        const userData = loadUserData();
        if (!userData[userId]) {
            userData[userId] = {
                panda: {
                    name: `${username}'s Panda`,
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
                quests: { completed: 0, abandoned: 0 }
            };
        }
        userData[userId].activeQuest = questData;
        saveUserData(userData);
    }
}

async function clearUserActiveQuest(userId, username) {
    await saveUserActiveQuest(userId, username, null);
}

module.exports = {
    name: 'quest',
    aliases: ['adventure', 'mission'],
    description: 'Embark on epic multi-step adventures across Panfu island',

    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Embark on epic multi-step adventures across Panfu island')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Begin a new quest adventure')
        )
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('Check your current quest progress')
        )
        .addSubcommand(sub =>
            sub.setName('continue')
                .setDescription('Continue to the next step of your quest')
        )
        .addSubcommand(sub =>
            sub.setName('abandon')
                .setDescription('Abandon your current quest')
        ),

    async execute(message, args, client) {
        await interaction.deferReply();
        const userId = message.author.id;
        const username = message.author.username;
        const subcommand = args[0] || 'status';

        switch (subcommand) {
            case 'start':
                const activeQuest = await getUserActiveQuest(userId, username);
                if (activeQuest) {
                    return message.reply("🗡️ You're already on a quest! Use `/quest status` to check progress or `/quest abandon` to quit.");
                }

                const quest = quests[Math.floor(Math.random() * quests.length)];
                const questData = {
                    ...quest,
                    currentStep: 1,
                    startTime: Date.now(),
                    stepsCompleted: []
                };

                await saveUserActiveQuest(userId, username, questData);

                const startEmbed = new EmbedBuilder()
                    .setTitle(`⚔️ ${quest.title}`)
                    .setColor(0xe67e22)
                    .setDescription(
                        `${quest.description}\n\n` +
                        `**Step 1:** ${quest.steps[0].description}\n\n` +
                        `**Quest Commands:**\n` +
                        `• \`/quest continue\` - Proceed to next step\n` +
                        `• \`/quest status\` - Check progress\n` +
                        `• \`/quest abandon\` - Quit quest\n\n` +
                        `**Total Reward:** ${quest.totalReward} coins`
                    )
                    .setFooter({ text: "Your adventure begins now!" });

                return message.reply({ embeds: [startEmbed] });

            case 'status':
                const userQuest = await getUserActiveQuest(userId, username);
                if (!userQuest) {
                    return message.reply("🗺️ You're not currently on any quest! Use `/quest start` to begin an adventure.");
                }

                const currentStepData = userQuest.steps[userQuest.currentStep - 1];
                const progressBar = "█".repeat(userQuest.currentStep - 1) + "▓".repeat(userQuest.steps.length - userQuest.currentStep + 1);

                const statusEmbed = new EmbedBuilder()
                    .setTitle(`📋 ${userQuest.title}`)
                    .setColor(0x3498db)
                    .setDescription(`${userQuest.description}`)
                    .addFields([
                        { 
                            name: "Progress", 
                            value: `Step ${userQuest.currentStep}/${userQuest.steps.length}\n\`${progressBar}\``, 
                            inline: false 
                        },
                        { 
                            name: "Current Step", 
                            value: currentStepData.description, 
                            inline: false 
                        },
                        { 
                            name: "Step Reward", 
                            value: `${currentStepData.reward} coins`, 
                            inline: true 
                        },
                        { 
                            name: "Total Quest Reward", 
                            value: `${userQuest.totalReward} coins`, 
                            inline: true 
                        }
                    ])
                    .setFooter({ text: "Use '/quest continue' to proceed" });

                return message.reply({ embeds: [statusEmbed] });

            case 'continue':
                const currentQuest = await getUserActiveQuest(userId, username);
                if (!currentQuest) {
                    return message.reply("🗺️ You're not on any quest! Start one with `/quest start`.");
                }

                const stepData = currentQuest.steps[currentQuest.currentStep - 1];
                currentQuest.stepsCompleted.push(currentQuest.currentStep);

                // Award coins and XP using database or JSON storage
                let usingDatabase = !!(database && database.isInitialized());
                let currentCoins = 0;
                const xpReward = stepData.reward * 2; // XP reward is 2x coins

                if (usingDatabase) {
                    try {
                        // Award coins
                        await database.updateUserCoins(userId, stepData.reward);
                        // Award XP
                        await database.addUserXP(userId, xpReward, message.guild?.id);
                        const userProfile = await database.getUserProfile(userId, username);
                        currentCoins = userProfile.coins;
                    } catch (error) {
                        console.error('Database error, falling back to JSON:', error);
                        usingDatabase = false;
                    }
                }

                if (!usingDatabase) {
                    const userData = loadUserData();
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
                            quests: { completed: 0, abandoned: 0 }
                        };
                    }

                    if (!userData[userId].quests) {
                        userData[userId].quests = { completed: 0, abandoned: 0 };
                    }

                    userData[userId].coins += stepData.reward;
                    userData[userId].experience += xpReward;
                    // Calculate level
                    if (database && database.calculateLevelFromXP) {
                        userData[userId].level = database.calculateLevelFromXP(userData[userId].experience);
                    }
                    currentCoins = userData[userId].coins;
                    saveUserData(userData);
                }

                if (currentQuest.currentStep >= currentQuest.steps.length) {
                    // Quest completed!
                    await clearUserActiveQuest(userId, username);

                    const completeEmbed = new EmbedBuilder()
                        .setTitle("🏆 Quest Completed!")
                        .setColor(0x2ecc71)
                        .setDescription(
                            `**${currentQuest.title}** has been completed!\n\n` +
                            `**Final Step:** ${stepData.description} ✅\n` +
                            `**Step Reward:** ${stepData.reward} coins\n` +
                            `**Total Quest Reward:** ${currentQuest.totalReward} coins\n` +
                            `**Your Balance:** ${currentCoins} coins`
                        )
                        .setFooter({ text: "Adventure complete! Start a new quest anytime." });

                    return message.reply({ embeds: [completeEmbed] });
                } else {
                    // Continue to next step
                    currentQuest.currentStep++;
                    const nextStep = currentQuest.steps[currentQuest.currentStep - 1];
                    await saveUserActiveQuest(userId, username, currentQuest);

                    const continueEmbed = new EmbedBuilder()
                        .setTitle(`⚔️ ${currentQuest.title}`)
                        .setColor(0xf39c12)
                        .setDescription(
                            `**Previous Step Completed:** ${stepData.description} ✅\n` +
                            `**Reward Earned:** ${stepData.reward} coins\n\n` +
                            `**Next Step (${currentQuest.currentStep}/${currentQuest.steps.length}):** ${nextStep.description}\n` +
                            `**Step Reward:** ${nextStep.reward} coins\n\n` +
                            `**Current Balance:** ${currentCoins} coins`
                        )
                        .setFooter({ text: "Continue your adventure!" });

                    return message.reply({ embeds: [continueEmbed] });
                }

            case 'abandon':
                const abandonedQuest = await getUserActiveQuest(userId, username);
                if (!abandonedQuest) {
                    return message.reply("🗺️ You're not currently on any quest!");
                }

                await clearUserActiveQuest(userId, username);

                return message.reply(
                    `🏃 You abandoned **${abandonedQuest.title}** at step ${abandonedQuest.currentStep}.\n` +
                    `No rewards were lost. Start a new quest anytime!`
                );

            default:
                return message.reply("⚔️ Use `/quest start`, `/quest status`, `/quest continue`, or `/quest abandon`!");
        }
    }
};
