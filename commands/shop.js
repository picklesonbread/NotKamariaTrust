const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');

// Import database utilities  
const database = require('../utils/database');

// Shop inventory
const shopItems = [
  { name: "Gold Bar", price: 10, description: "Shiny, useless flex." },
  { name: "Banana Taxi Ticket", price: 5, description: "One-way ride to disappointment." },
  { name: "Bamboo Chair", price: 7, description: "Perfect for sitting in silence after another failed quest." },
  { name: "Kamaria's Patience", price: 20, description: "Consumable. Instantly runs out when you speak." },
  { name: "Max's Detective Boots", price: 15, description: "+5 speed, -10 ethics." },
  { name: "Swamp of Sadness Water", price: 8, description: "Drink for immediate regret and +3 melancholy." },
  { name: "Haunted Tower Dust Bunny", price: 6, description: "Haunted, judgmental, and somehow sticky." },
  { name: "Alpha Panda Energy Drink", price: 12, description: "Promises rizz; delivers heartburn." }
];

module.exports = {
    name: 'shop',
    aliases: ['store'],
    description: 'View or buy cursed Panfu items from the shop',

    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('View or buy cursed Panfu items.')
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('View all available shop items.')
        )
        .addSubcommand(sub =>
            sub.setName('buy')
                .setDescription('Purchase an item from the shop.')
                .addStringOption(opt =>
                    opt.setName('item')
                        .setDescription('Name of the item to buy')
                        .setRequired(true)
                )
        ),

    async execute(message, args, client) {
        const userId = message.author.id;
        let storage = (database && database.isInitialized()) ? 'db' : 'json';
        let user;

      await interaction.deferReply();
      
        // Get user data from database or JSON fallback
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
                    inventory: {},
                    joinedAt: new Date().toISOString()
                };
                saveUserData(userData);
            }
            user = userData[userId];
        }

        const subcommand = args[0] || 'list';

        if (subcommand === 'list') {
            const userCoins = storage === 'db' ? user.coins : user.coins;
            const embed = new EmbedBuilder()
                .setTitle("🛒 Cursed Panfu Shop")
                .setColor(0xf1c40f)
                .setDescription(shopItems.map(i =>
                    `**${i.name}** — ${i.price} coins\n*${i.description}*`
                ).join('\n\n'))
                .setFooter({ text: `Your balance: ${userCoins} coins` });

            return message.reply({ embeds: [embed] });
        }

        if (subcommand === 'buy') {
            const itemName = args.slice(1).join(' ');

            if (!itemName) {
                return message.reply('🛒 Please specify what you want to buy! Use `!shop buy [item name]`');
            }

            const item = shopItems.find(i =>
                i.name.toLowerCase() === itemName.toLowerCase()
            );

            if (!item) {
                return message.reply("🚫 That item doesn't exist. Even Max's detective skills couldn't find it.");
            }

            const userCoins = storage === 'db' ? user.coins : user.coins;

            if (userCoins < item.price) {
                return message.reply(`💸 You only have ${userCoins} coins. Stop being poor.`);
            }

            // Get current inventory
            let inventory = storage === 'db' 
                ? (user.inventory || {}) 
                : (user.inventory || {});

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
                    
                    // Update inventory in database
                    await database.updateUserProfile(userId, {
                        inventory: inventory
                    });

                    const newBalance = userCoins - item.price;

                    return message.reply(
                        `🛍️ **Purchase successful!**\n${message.author} bought **${item.name}** for ${item.price} coins.\n` +
                        `Balance left: **${newBalance}** coins.\n` +
                        `Item effect: *${item.description}*`
                    );
                } catch (error) {
                    console.error('Error updating shop purchase in database:', error);
                    return message.reply('❌ Failed to complete purchase. Please try again.');
                }
            } else {
                // JSON fallback
                const userData = loadUserData();
                userData[userId].coins -= item.price;
                userData[userId].inventory = inventory;
                saveUserData(userData);

                return message.reply(
                    `🛍️ **Purchase successful!**\n${message.author} bought **${item.name}** for ${item.price} coins.\n` +
                    `Balance left: **${userData[userId].coins}** coins.\n` +
                    `Item effect: *${item.description}*`
                );
            }
        }

        return message.reply('🛒 Use `!shop list` to see items or `!shop buy [item]` to purchase!');
    }
};
