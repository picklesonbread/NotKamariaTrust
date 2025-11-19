const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');

await interaction.deferReply();

// Import database utilities  
const database = require('../utils/database');

// Different eras of Panfu with nostalgic references
const eras = [
    {
        name: "Golden Age (2007-2009)",
        emoji: "✨",
        description: "The peak of Panfu when everyone was young and innocent",
        events: [
            "Max hasn't started his side business yet - he's actually helpful!",
            "The Disco Dome has different music every hour and nobody complains",
            "Kamaria gives genuinely useful prophecies instead of roasts",
            "Ella is just a regular reporter, not a media mogul",
            "The Swamp of Sadness is called 'Swamp of Mild Disappointment'",
            "Free bamboo for everyone - the economy hasn't crashed yet"
        ],
        items: ["Ancient Disco Ball", "Original Bamboo", "Vintage Karate Belt"],
        reward: 20
    },
    {
        name: "The Drama Era (2010-2012)", 
        emoji: "🎭",
        description: "When relationships got complicated and everyone had opinions",
        events: [
            "The Great Igloo Wars have begun - territory disputes everywhere",
            "Pandas are forming cliques based on karate belt colors",
            "Someone starts drama about who owns which dance moves",
            "The lighthouse keeper refuses to help anyone who isn't 'cool enough'",
            "Secret underground bamboo trading rings emerge",
            "Ella begins building her media network through strategic partnerships"
        ],
        items: ["Drama Crown", "Gossip Scroll", "Betrayal Dagger"],
        reward: 15
    },
    {
        name: "The Apocalypse (2013-2016)",
        emoji: "💀", 
        description: "The beginning of the end - things started getting weird",
        events: [
            "Half the pandas have mysteriously vanished - nobody talks about it",
            "The volcano starts acting suspicious and making ominous sounds",
            "Max's investigative side-hustles become increasingly elaborate",
            "Kamaria's prophecies turn dark and oddly specific",
            "The Disco Dome plays the same song for 3 months straight",
            "Economic collapse - bamboo becomes a luxury item"
        ],
        items: ["Cursed Bamboo", "Prophecy of Doom", "Last Dance Ticket"],
        reward: 25
    },
    {
        name: "Post-Apocalyptic Wasteland (2017-2020)",
        emoji: "🏚️",
        description: "The aftermath - only the strongest pandas survived",
        events: [
            "Survivors huddle around the dying embers of the Disco Dome",
            "Ella becomes the voice of the remaining pandas through her broadcasts",
            "The jungle has been overtaken by mutant vegetables",
            "Time moves differently - days feel like years",
            "Ancient pandas tell legends of the 'Golden Age' to confused youngsters",
            "The lighthouse becomes a beacon for lost souls"
        ],
        items: ["Survival Rations", "Makeshift Shelter", "Hope Fragment"],
        reward: 30
    },
    {
        name: "The Renaissance (2021-Present)",
        emoji: "🌅",
        description: "New pandas arrive and try to rebuild civilization",
        events: [
            "Fresh pandas with no knowledge of the Dark Times arrive",
            "Attempt to restore the Disco Dome to its former glory",
            "Max tries to sell 'exclusive historical scoops' at inflated prices",
            "Kamaria becomes a tour guide for the 'authentic Panfu experience'",
            "Old pandas become grumpy mentors who complain about modern pandas",
            "The Great Rebuilding begins - with mixed results"
        ],
        items: ["New Hope Token", "Rebuilt Disco Ball", "Modern Bamboo"],
        reward: 18
    }
];

module.exports = {
    name: 'timetravel',
    aliases: ['time', 'era', 'nostalgia'],
    description: 'Travel through different eras of Panfu history',

    data: new SlashCommandBuilder()
        .setName('timetravel')
        .setDescription('Travel through different eras of Panfu history')
        .addStringOption(opt =>
            opt.setName('era')
                .setDescription('Which era do you want to visit?')
                .addChoices(
                    { name: 'Golden Age (2007-2009)', value: 'golden' },
                    { name: 'Drama Era (2010-2012)', value: 'drama' },
                    { name: 'Apocalypse (2013-2016)', value: 'apocalypse' },
                    { name: 'Wasteland (2017-2020)', value: 'wasteland' },
                    { name: 'Renaissance (2021-Present)', value: 'renaissance' },
                    { name: 'Random Era', value: 'random' }
                )
        ),

    async execute(message, args, client) {
        const userId = message.author.id;
        let chosenEra = args[0]?.toLowerCase();

        if (!chosenEra || chosenEra === 'random') {
            chosenEra = ['golden', 'drama', 'apocalypse', 'wasteland', 'renaissance'][Math.floor(Math.random() * 5)];
        }

        const eraMap = {
            'golden': 0,
            'drama': 1, 
            'apocalypse': 2,
            'wasteland': 3,
            'renaissance': 4
        };

        const era = eras[eraMap[chosenEra]] || eras[Math.floor(Math.random() * eras.length)];
        const event = era.events[Math.floor(Math.random() * era.events.length)];
        const item = era.items[Math.floor(Math.random() * era.items.length)];

        let storage = (database && database.isInitialized()) ? 'db' : 'json';
        let user;
        let timetravelData = { trips: 0, artifacts: [] };
        let inventory = {};

        // Get user data from database or JSON fallback
        if (storage === 'db') {
            try {
                user = await database.getUserProfile(userId, message.author.username);
                if (!user) throw new Error('Database unavailable');
                
                // Get timetravel stats from database stats field if available
                if (user.stats && user.stats.timetravel_trips !== undefined) {
                    timetravelData.trips = user.stats.timetravel_trips || 0;
                    timetravelData.artifacts = user.stats.timetravel_artifacts || [];
                }
                
                // Get inventory
                inventory = user.inventory || {};
            } catch (error) {
                console.log('Database error, falling back to JSON storage:', error.message);
                storage = 'json';
            }
        }

        if (storage === 'json') {
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
                    timetravel: { trips: 0, artifacts: [] },
                    inventory: {}
                };
                saveUserData(userData);
            }

            if (!userData[userId].timetravel) {
                userData[userId].timetravel = { trips: 0, artifacts: [] };
            }

            if (!userData[userId].inventory) {
                userData[userId].inventory = {};
            }

            user = userData[userId];
            timetravelData = userData[userId].timetravel;
            inventory = userData[userId].inventory;
        }

        // Add item to inventory
        if (inventory[item]) {
            inventory[item]++;
        } else {
            inventory[item] = 1;
        }

        // Update artifacts list
        if (!timetravelData.artifacts.includes(item)) {
            timetravelData.artifacts.push(item);
        }

        // Increment trips
        timetravelData.trips++;

        // Update database or JSON
        if (storage === 'db') {
            try {
                // Add coins
                await database.updateUserCoins(userId, era.reward);
                
                // Update inventory
                await database.updateUserProfile(userId, {
                    inventory: inventory
                });

                // Update timetravel stats in stats field
                await database.updateUserStats(userId, {
                    timetravel_trips: timetravelData.trips,
                    timetravel_artifacts: timetravelData.artifacts
                });

                const newBalance = user.coins + era.reward;

                const travelEmbed = new EmbedBuilder()
                    .setTitle(`${era.emoji} Time Travel: ${era.name}`)
                    .setColor(0x9b59b6)
                    .setDescription(
                        `**Era Description:** ${era.description}\n\n` +
                        `**What You Witness:** ${event}\n\n` +
                        `**Historical Artifact Found:** ${item}\n` +
                        `**Time Travel Reward:** ${era.reward} coins\n\n` +
                        `**Your Balance:** ${newBalance} coins\n` +
                        `**Time Travel Stats:** ${timetravelData.trips} trips, ${timetravelData.artifacts.length} unique artifacts collected`
                    )
                    .setFooter({ text: "Time travel may cause existential dread and temporal paradoxes" });

                return message.reply({ embeds: [travelEmbed] });
            } catch (error) {
                console.error('Error updating timetravel in database:', error);
                return message.reply('❌ Failed to complete time travel. Please try again.');
            }
        } else {
            // JSON fallback
            const userData = loadUserData();
            userData[userId].coins += era.reward;
            userData[userId].timetravel = timetravelData;
            userData[userId].inventory = inventory;
            saveUserData(userData);

            const travelEmbed = new EmbedBuilder()
                .setTitle(`${era.emoji} Time Travel: ${era.name}`)
                .setColor(0x9b59b6)
                .setDescription(
                    `**Era Description:** ${era.description}\n\n` +
                    `**What You Witness:** ${event}\n\n` +
                    `**Historical Artifact Found:** ${item}\n` +
                    `**Time Travel Reward:** ${era.reward} coins\n\n` +
                    `**Your Balance:** ${userData[userId].coins} coins\n` +
                    `**Time Travel Stats:** ${timetravelData.trips} trips, ${timetravelData.artifacts.length} unique artifacts collected`
                )
                .setFooter({ text: "Time travel may cause existential dread and temporal paradoxes" });

            return message.reply({ embeds: [travelEmbed] });
        }
    }
};
