const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');

// Import database utilities  
const database = require('../utils/database');

// Max's sketchy black market items (detective side hustle)
const blackMarketItems = [
    { name: "Stolen Disco Ball", price: 50, description: "\"Curio from an old case\" - Gonzo", rarity: "Legendary", risk: 0.1 },
    { name: "Counterfeit Gold Bar", price: 25, description: "Looks real from a distance", rarity: "Rare", risk: 0.2 },
    { name: "Expired Fish", price: 3, description: "Still moving... somehow", rarity: "Common", risk: 0.5 },
    { name: "Bootleg Bamboo", price: 8, description: "Tastes like sadness", rarity: "Common", risk: 0.3 },
    { name: "Hot Karate Belt", price: 35, description: "Previous owner \"mysteriously\" vanished", rarity: "Rare", risk: 0.15 },
    { name: "Cursed Lighthouse Lens", price: 75, description: "Glows ominously at night", rarity: "Legendary", risk: 0.05 },
    { name: "Suspicious Igloo Blueprints", price: 20, description: "Build a secret hideout", rarity: "Uncommon", risk: 0.25 },
    { name: "Ella's Lost Diary", price: 100, description: "Contains embarrassing secrets", rarity: "Mythic", risk: 0.02 }
];

// Gonzo's random phrases (shady black market dealer)
const gonzoPhrases = [
    "welcome to Gonzo's Black Market — where nothing's legal but everything's available.",
    "these items definitely didn't fall off the back of a white van...",
    "shhh, keep it quiet — even Kamaria doesn't know i got this stuff.",
    "the mods would ban me if they knew i was selling this… so keep it hush-hush.",
    "gold only, no refunds, no receipts. that's the Gonzo guarantee.",
    "fresh from the dumpster behind the Panfu Shop™.",
    "u didn't get this from me, capisce?",
    "high quality* (*quality may vary drastically)."
];

module.exports = {
    name: 'blackmarket',
    aliases: ['gonzo', 'underground'],
    description: 'visit Gonzo\'s sketchy underground trading post',

    data: new SlashCommandBuilder()
        .setName('blackmarket')
        .setDescription('visit Gonzo\'s sketchy underground trading post')
        .addSubcommand(sub =>
            sub.setName('browse')
                .setDescription('see what suspicious items Gonzo has for sale')
        )
        .addSubcommand(sub =>
            sub.setName('buy')
                .setDescription('purchase a sketchy item from Gonzo')
                .addStringOption(opt =>
                    opt.setName('item')
                        .setDescription('name of the item to buy')
                        .setRequired(true)
                )
        ),

    async execute(message, args, client) {
        const userId = message.author.id;
        const subcommand = args[0] || 'browse';

        switch (subcommand) {
            case 'browse':
                const maxQuote = gonzoPhrases[Math.floor(Math.random() * gonzoPhrases.length)];
                const availableItems = blackMarketItems.slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 random items

                const browseEmbed = new EmbedBuilder()
                    .setTitle("🕴️ Gonzo's Black Market")
                    .setColor(0x2c3e50)
                    .setDescription(
                        `*${maxQuote}*\n\n` +
                        availableItems.map(item => 
                            `**${item.name}** - ${item.price} coins\n` +
                            `*${item.description}* (${item.rarity})`
                        ).join('\n\n')
                    )
                    .setFooter({ text: "use '/blackmarket buy item:[item name]' to purchase" });

                return message.reply({ embeds: [browseEmbed] });

            case 'buy':
                const itemName = args.slice(1).join(' ');
                if (!itemName) {
                    return message.reply("🕵️ what do you want to buy? specify an item name!");
                }

                const item = blackMarketItems.find(i => 
                    i.name.toLowerCase().includes(itemName.toLowerCase())
                );

                if (!item) {
                    return message.reply("🕵️ Gonzo doesn't have that item. Check `/blackmarket browse` for available items.");
                }

                let storage = (database && database.isInitialized()) ? 'db' : 'json';
                let user;
                let blackmarketData = { purchases: 0, busted: 0 };
                let inventory = {};

                // Get user data from database or JSON fallback
                if (storage === 'db') {
                    try {
                        user = await database.getUserProfile(userId, message.author.username);
                        if (!user) throw new Error('Database unavailable');
                        
                        // Get blackmarket stats from database stats field if available
                        if (user.stats && user.stats.blackmarket_purchases !== undefined) {
                            blackmarketData.purchases = user.stats.blackmarket_purchases || 0;
                            blackmarketData.busted = user.stats.blackmarket_busted || 0;
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
                            blackmarket: { purchases: 0, busted: 0 },
                            inventory: {}
                        };
                        saveUserData(userData);
                    }

                    if (!userData[userId].blackmarket) {
                        userData[userId].blackmarket = { purchases: 0, busted: 0 };
                    }

                    if (!userData[userId].inventory) {
                        userData[userId].inventory = {};
                    }

                    user = userData[userId];
                    blackmarketData = userData[userId].blackmarket;
                    inventory = userData[userId].inventory;
                }

                const userCoins = storage === 'db' ? user.coins : user.coins;

                if (userCoins < item.price) {
                    return message.reply(`💸 u need ${item.price} coins but only have ${userCoins}. come back when you're not poor.`);
                }

                // Risk calculation - chance of getting busted
                const busted = Math.random() < item.risk;

                if (busted) {
                    blackmarketData.busted++;
                    const fine = Math.floor(item.price * 0.5);

                    // Update database or JSON
                    if (storage === 'db') {
                        try {
                            // Deduct fine
                            await database.updateUserCoins(userId, -fine);
                            
                            // Update blackmarket stats
                            await database.updateUserStats(userId, {
                                blackmarket_busted: blackmarketData.busted
                            });

                            const newBalance = userCoins - fine;

                            return message.reply(
                                `🚨 **BUSTED!** Ella published an exposé about shady dealings!\n` +
                                `Island Moderators fined you ${fine} coins and confiscated the item.\n` +
                                `Gonzo slipped away. Balance: ${newBalance} coins\n\n` +
                                `**Criminal Record:** ${blackmarketData.busted} times busted`
                            );
                        } catch (error) {
                            console.error('Error handling blackmarket bust in database:', error);
                            return message.reply('❌ Failed to process transaction. Please try again.');
                        }
                    } else {
                        // JSON fallback
                        const userData = loadUserData();
                        userData[userId].coins -= fine;
                        userData[userId].blackmarket.busted = blackmarketData.busted;
                        saveUserData(userData);

                        return message.reply(
                            `🚨 **BUSTED!** Ella published an exposé about shady dealings!\n` +
                            `Island Moderators fined you ${fine} coins and confiscated the item.\n` +
                            `Gonzo slipped away. Balance: ${userData[userId].coins} coins\n\n` +
                            `**Criminal Record:** ${blackmarketData.busted} times busted`
                        );
                    }
                }

                // Successful purchase
                blackmarketData.purchases++;

                // Add item to inventory
                if (inventory[item.name]) {
                    inventory[item.name]++;
                } else {
                    inventory[item.name] = 1;
                }

                // Update database or JSON
                if (storage === 'db') {
                    try {
                        // Deduct coins
                        await database.updateUserCoins(userId, -item.price);
                        
                        // Update inventory
                        await database.updateUserProfile(userId, {
                            inventory: inventory
                        });

                        // Update blackmarket stats
                        await database.updateUserStats(userId, {
                            blackmarket_purchases: blackmarketData.purchases
                        });

                        const newBalance = userCoins - item.price;

                        const successEmbed = new EmbedBuilder()
                            .setTitle("🕵️ Black Market Purchase")
                            .setColor(0x27ae60)
                            .setDescription(
                                `**Transaction Complete!**\n\n` +
                                `**Item:** ${item.name}\n` +
                                `**Price:** ${item.price} coins\n` +
                                `**Description:** ${item.description}\n` +
                                `**Rarity:** ${item.rarity}\n\n` +
                                `*Gonzo whispers: "keep this off the record..."*\n\n` +
                                `**Remaining Balance:** ${newBalance} coins\n` +
                                `**Black Market Stats:** ${blackmarketData.purchases} purchases, ${blackmarketData.busted} times busted`
                            );

                        return message.reply({ embeds: [successEmbed] });
                    } catch (error) {
                        console.error('Error completing blackmarket purchase in database:', error);
                        return message.reply('❌ Failed to complete purchase. Please try again.');
                    }
                } else {
                    // JSON fallback
                    const userData = loadUserData();
                    userData[userId].coins -= item.price;
                    userData[userId].blackmarket = blackmarketData;
                    userData[userId].inventory = inventory;
                    saveUserData(userData);

                    const successEmbed = new EmbedBuilder()
                        .setTitle("🕵️ Black Market Purchase")
                        .setColor(0x27ae60)
                        .setDescription(
                            `**Transaction Complete!**\n\n` +
                            `**Item:** ${item.name}\n` +
                            `**Price:** ${item.price} coins\n` +
                            `**Description:** ${item.description}\n` +
                            `**Rarity:** ${item.rarity}\n\n` +
                            `*Gonzo whispers: "keep this off the record..."*\n\n` +
                            `**Remaining Balance:** ${userData[userId].coins} coins\n` +
                            `**Black Market Stats:** ${blackmarketData.purchases} purchases, ${blackmarketData.busted} times busted`
                        );

                    return message.reply({ embeds: [successEmbed] });
                }

            default:
                return message.reply("🕵️ use `/blackmarket browse` or `/blackmarket buy` commands!");
        }
    }
};
