const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

// Collectible stamps with different rarities
const stamps = [
    { name: "Volcano Explorer", rarity: "Common", description: "Visited the volcano without getting roasted", emoji: "🌋" },
    { name: "Disco Legend", rarity: "Uncommon", description: "Danced for 3 hours straight", emoji: "💃" },
    { name: "Swamp Survivor", rarity: "Common", description: "Made it through the Swamp of Sadness", emoji: "🪱" },
    { name: "Lighthouse Keeper", rarity: "Rare", description: "Helped lost pandas find their way", emoji: "🔦" },
    { name: "Castle Noble", rarity: "Rare", description: "Gained audience with Kamaria", emoji: "🏰" },
    { name: "Jungle Adventurer", rarity: "Uncommon", description: "Found the secret banana stash", emoji: "🌴" },
    { name: "Beach Bum", rarity: "Common", description: "Built the perfect sandcastle", emoji: "🏖️" },
    { name: "Karate Master", rarity: "Rare", description: "Achieved inner peace (temporarily)", emoji: "🥋" },
    { name: "Bonez's Customer", rarity: "Legendary", description: "Survived a transaction with Bonez", emoji: "🕴️" },
    { name: "Eloise's Favorite", rarity: "Mythic", description: "Somehow impressed the fashion queen", emoji: "👑" },
    { name: "Time Traveler", rarity: "Legendary", description: "Witnessed the rise and fall of civilizations", emoji: "⏰" },
    { name: "Mystery Solver", rarity: "Rare", description: "Cracked the unsolvable case", emoji: "🔍" },
    { name: "Quest Hero", rarity: "Uncommon", description: "Completed an epic adventure", emoji: "⚔️" },
    { name: "Gambler", rarity: "Uncommon", description: "Won big at the banana bet", emoji: "🍌" },
    { name: "Collector", rarity: "Mythic", description: "Collected all common stamps", emoji: "📚" }
];

// Stamp trading values
const rarityValues = {
    "Common": 1,
    "Uncommon": 3,
    "Rare": 8,
    "Legendary": 20,
    "Mythic": 50
};

module.exports = {
    name: 'stamps',
    aliases: ['collection', 'collect'],
    description: 'Collect and trade rare Panfu stamps',

    data: new SlashCommandBuilder()
        .setName('stamps')
        .setDescription('Collect and trade rare Panfu stamps')
        .addSubcommand(sub =>
            sub.setName('collection')
                .setDescription('View your stamp collection')
        )
        .addSubcommand(sub =>
            sub.setName('find')
                .setDescription('Search for a new stamp (costs 5 coins)')
        )
        .addSubcommand(sub =>
            sub.setName('trade')
                .setDescription('Trade stamps with another panda')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('Panda to trade with')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('offer')
                        .setDescription('Stamp you want to trade')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('request')
                        .setDescription('Stamp you want in return')
                        .setRequired(true)
                )
        ),

    async execute(message, args, client) {
        const userId = message.author.id;
        const subcommand = args[0] || 'collection';

        await interaction.deferReply();
        
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
                stamps: { collection: {}, searches: 0 }
            };
        }

        if (!userData[userId].stamps) {
            userData[userId].stamps = { collection: {}, searches: 0 };
        }

        switch (subcommand) {
            case 'collection':
                const collection = userData[userId].stamps.collection;
                const totalStamps = Object.values(collection).reduce((a, b) => a + b, 0);
                const uniqueStamps = Object.keys(collection).length;

                if (uniqueStamps === 0) {
                    return message.reply("📭 Your stamp collection is empty! Use `/stamps find` to search for stamps (costs 5 coins).");
                }

                const collectionDisplay = Object.entries(collection)
                    .map(([stampName, count]) => {
                        const stamp = stamps.find(s => s.name === stampName);
                        return `${stamp.emoji} **${stampName}** (${stamp.rarity}) x${count}`;
                    })
                    .join('\n');

                const collectionEmbed = new EmbedBuilder()
                    .setTitle("📚 Your Stamp Collection")
                    .setColor(0xe74c3c)
                    .setDescription(
                        `**Collection Stats:**\n` +
                        `• Total Stamps: ${totalStamps}\n` +
                        `• Unique Stamps: ${uniqueStamps}/${stamps.length}\n` +
                        `• Searches Made: ${userData[userId].stamps.searches}\n\n` +
                        `**Your Stamps:**\n${collectionDisplay}`
                    )
                    .setFooter({ text: "Use '/stamps find' to search for more!" });

                return message.reply({ embeds: [collectionEmbed] });

            case 'find':
                // Check balance from database if available, otherwise use JSON
                let currentCoins = userData[userId].coins;
                if (database && database.isInitialized()) {
                    try {
                        const dbUser = await database.getUserProfile(userId, message.author.username);
                        if (dbUser) currentCoins = dbUser.coins;
                    } catch (error) {
                        console.log('Database read failed for stamps, using JSON:', error.message);
                    }
                }

                if (currentCoins < 5) {
                    return message.reply("💸 You need 5 coins to search for stamps! Earn more with daily rewards or quests.");
                }

                // Deduct coins from database if available
                if (database && database.isInitialized()) {
                    try {
                        await database.updateUserCoins(userId, -5);
                    } catch (error) {
                        console.log('Database coin deduction failed, using JSON:', error.message);
                        userData[userId].coins -= 5;
                    }
                } else {
                    userData[userId].coins -= 5;
                }

                userData[userId].stamps.searches++;

                // Rarity chances: Common 50%, Uncommon 30%, Rare 15%, Legendary 4.5%, Mythic 0.5%
                const rarityChance = Math.random();
                let rarity;
                if (rarityChance < 0.5) rarity = "Common";
                else if (rarityChance < 0.8) rarity = "Uncommon";
                else if (rarityChance < 0.95) rarity = "Rare";
                else if (rarityChance < 0.995) rarity = "Legendary";
                else rarity = "Mythic";

                const availableStamps = stamps.filter(s => s.rarity === rarity);
                const foundStamp = availableStamps[Math.floor(Math.random() * availableStamps.length)];

                if (userData[userId].stamps.collection[foundStamp.name]) {
                    userData[userId].stamps.collection[foundStamp.name]++;
                } else {
                    userData[userId].stamps.collection[foundStamp.name] = 1;
                }

                saveUserData(userData);

                // Get updated balance
                let newBalance = userData[userId].coins;
                if (database && database.isInitialized()) {
                    try {
                        const dbUser = await database.getUserProfile(userId, message.author.username);
                        if (dbUser) newBalance = dbUser.coins;
                    } catch (error) {
                        // Use JSON balance
                    }
                }

                const findEmbed = new EmbedBuilder()
                    .setTitle("🔍 Stamp Discovery!")
                    .setColor(rarity === "Mythic" ? 0xf1c40f : rarity === "Legendary" ? 0xe67e22 : 0x3498db)
                    .setDescription(
                        `${foundStamp.emoji} **${foundStamp.name}** discovered!\n\n` +
                        `**Rarity:** ${foundStamp.rarity}\n` +
                        `**Description:** ${foundStamp.description}\n` +
                        `**Search Cost:** 5 coins\n` +
                        `**Remaining Balance:** ${newBalance} coins\n\n` +
                        `You now have ${userData[userId].stamps.collection[foundStamp.name]} of this stamp!`
                    );

                return message.reply({ embeds: [findEmbed] });

            case 'trade':
                return message.reply("🔄 Trading feature coming soon! For now, enjoy collecting stamps.");

            default:
                return message.reply("📚 Use `collection`, `find`, or `trade` with the stamps command!");
        }
    }
};
