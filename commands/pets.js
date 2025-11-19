const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');

await interaction.deferReply();

// Import database utilities  
const database = require('../utils/database');

// Pet types and their characteristics
const petTypes = [
    { name: "Bamboo Sprout", emoji: "🌱", rarity: "Common", happiness: 50, energy: 70, hunger: 30 },
    { name: "Disco Puffle", emoji: "✨", rarity: "Uncommon", happiness: 80, energy: 90, hunger: 40 },
    { name: "Swamp Tadpole", emoji: "🐸", rarity: "Common", happiness: 30, energy: 60, hunger: 50 },
    { name: "Lighthouse Ghost", emoji: "👻", rarity: "Rare", happiness: 60, energy: 40, hunger: 10 },
    { name: "Castle Dragon", emoji: "🐉", rarity: "Legendary", happiness: 90, energy: 95, hunger: 80 },
    { name: "Jungle Monkey", emoji: "🐒", rarity: "Uncommon", happiness: 75, energy: 85, hunger: 60 },
    { name: "Beach Crab", emoji: "🦀", rarity: "Common", happiness: 55, energy: 50, hunger: 45 },
    { name: "Karate Turtle", emoji: "🐢", rarity: "Rare", happiness: 70, energy: 30, hunger: 35 }
];

// Pet activities and their effects
const activities = [
    { name: "feed", cost: 3, hungerChange: -30, happinessChange: 10, energyChange: 5, message: "nom nom nom! Your pet is satisfied." },
    { name: "play", cost: 2, hungerChange: 15, happinessChange: 25, energyChange: -20, message: "Your pet had a blast playing!" },
    { name: "sleep", cost: 1, hungerChange: 5, happinessChange: 5, energyChange: 40, message: "Your pet took a refreshing nap." },
    { name: "train", cost: 5, hungerChange: 20, happinessChange: 15, energyChange: -15, message: "Your pet learned some new tricks!" }
];

module.exports = {
    name: 'pets',
    aliases: ['pet', 'adopt'],
    description: 'Adopt and care for virtual Panfu pets',

    data: new SlashCommandBuilder()
        .setName('pets')
        .setDescription('Adopt and care for virtual Panfu pets')
        .addSubcommand(sub =>
            sub.setName('adopt')
                .setDescription('Adopt a new pet (costs 20 coins)')
        )
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('Check your pet\'s current status')
        )
        .addSubcommand(sub =>
            sub.setName('feed')
                .setDescription('Feed your pet (costs 3 coins)')
        )
        .addSubcommand(sub =>
            sub.setName('play')
                .setDescription('Play with your pet (costs 2 coins)')
        )
        .addSubcommand(sub =>
            sub.setName('sleep')
                .setDescription('Let your pet sleep (costs 1 coin)')
        )
        .addSubcommand(sub =>
            sub.setName('train')
                .setDescription('Train your pet (costs 5 coins)')
        ),

    async execute(message, args, client) {
        const userId = message.author.id;
        const subcommand = args[0] || 'status';

        let storage = (database && database.isInitialized()) ? 'db' : 'json';
        let user;
        let petData = null;

        // Get user data from database or JSON fallback
        if (storage === 'db') {
            try {
                user = await database.getUserProfile(userId, message.author.username);
                if (!user) throw new Error('Database unavailable');
                
                // Get pet data from database stats field if available
                if (user.stats && user.stats.pet !== undefined) {
                    petData = user.stats.pet;
                }
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
                    joinedAt: new Date().toISOString()
                };
                saveUserData(userData);
            }

            if (!userData[userId].pet) {
                userData[userId].pet = null;
            }

            user = userData[userId];
            petData = userData[userId].pet;
        }

        switch (subcommand) {
            case 'adopt':
                if (petData) {
                    return message.reply("🐾 You already have a pet! Take care of them first before adopting another.");
                }

                const userCoins = storage === 'db' ? user.coins : user.coins;

                if (userCoins < 20) {
                    return message.reply("💸 Pet adoption costs 20 coins! Earn more through daily rewards or quests.");
                }

                // Rarity chances for adoption
                const adoptionChance = Math.random();
                let rarity;
                if (adoptionChance < 0.6) rarity = "Common";
                else if (adoptionChance < 0.85) rarity = "Uncommon"; 
                else if (adoptionChance < 0.96) rarity = "Rare";
                else rarity = "Legendary";

                const availablePets = petTypes.filter(p => p.rarity === rarity);
                const adoptedPet = availablePets[Math.floor(Math.random() * availablePets.length)];

                petData = {
                    ...adoptedPet,
                    name: `${message.author.username}'s ${adoptedPet.name}`,
                    adoptedAt: new Date().toISOString(),
                    level: 1,
                    experience: 0,
                    lastCared: Date.now()
                };

                // Update database or JSON
                if (storage === 'db') {
                    try {
                        // Deduct coins
                        await database.updateUserCoins(userId, -20);
                        
                        // Update pet data in database stats
                        await database.updateUserStats(userId, {
                            pet: petData
                        });

                        const newBalance = userCoins - 20;

                        const adoptEmbed = new EmbedBuilder()
                            .setTitle("🎉 Pet Adoption Success!")
                            .setColor(0x2ecc71)
                            .setDescription(
                                `${adoptedPet.emoji} **${adoptedPet.name}** is now yours!\n\n` +
                                `**Rarity:** ${adoptedPet.rarity}\n` +
                                `**Adoption Cost:** 20 coins\n` +
                                `**Remaining Balance:** ${newBalance} coins\n\n` +
                                `**Starting Stats:**\n` +
                                `• Happiness: ${adoptedPet.happiness}/100\n` +
                                `• Energy: ${adoptedPet.energy}/100\n` +
                                `• Hunger: ${adoptedPet.hunger}/100\n\n` +
                                `Take good care of your new companion!`
                            );

                        return message.reply({ embeds: [adoptEmbed] });
                    } catch (error) {
                        console.error('Error adopting pet in database:', error);
                        return message.reply('❌ Failed to adopt pet. Please try again.');
                    }
                } else {
                    // JSON fallback
                    const userData = loadUserData();
                    userData[userId].coins -= 20;
                    userData[userId].pet = petData;
                    saveUserData(userData);

                    const adoptEmbed = new EmbedBuilder()
                        .setTitle("🎉 Pet Adoption Success!")
                        .setColor(0x2ecc71)
                        .setDescription(
                            `${adoptedPet.emoji} **${adoptedPet.name}** is now yours!\n\n` +
                            `**Rarity:** ${adoptedPet.rarity}\n` +
                            `**Adoption Cost:** 20 coins\n` +
                            `**Remaining Balance:** ${userData[userId].coins} coins\n\n` +
                            `**Starting Stats:**\n` +
                            `• Happiness: ${adoptedPet.happiness}/100\n` +
                            `• Energy: ${adoptedPet.energy}/100\n` +
                            `• Hunger: ${adoptedPet.hunger}/100\n\n` +
                            `Take good care of your new companion!`
                        );

                    return message.reply({ embeds: [adoptEmbed] });
                }

            case 'status':
                if (!petData) {
                    return message.reply("🐾 You don't have a pet yet! Use `/pets adopt` to get one (costs 20 coins).");
                }

                const pet = petData;
                const timeSinceCare = Date.now() - pet.lastCared;
                const hoursSinceCare = Math.floor(timeSinceCare / (1000 * 60 * 60));

                // Decay stats over time (pets get hungry/tired if neglected)
                pet.hunger = Math.min(100, pet.hunger + hoursSinceCare * 2);
                pet.energy = Math.max(0, pet.energy - hoursSinceCare * 1);
                pet.happiness = Math.max(0, pet.happiness - hoursSinceCare * 1);

                const getCondition = (happiness, energy, hunger) => {
                    if (happiness > 80 && energy > 70 && hunger < 30) return "Excellent! 😊";
                    if (happiness > 60 && energy > 50 && hunger < 50) return "Good 😌";
                    if (happiness > 40 && energy > 30 && hunger < 70) return "Okay 😐";
                    if (happiness > 20 && energy > 10 && hunger < 90) return "Poor 😞";
                    return "Critical! 😰";
                };

                const statusEmbed = new EmbedBuilder()
                    .setTitle(`${pet.emoji} ${pet.name}`)
                    .setColor(pet.happiness > 60 ? 0x2ecc71 : pet.happiness > 30 ? 0xf39c12 : 0xe74c3c)
                    .setDescription(
                        `**Rarity:** ${pet.rarity}\n` +
                        `**Level:** ${pet.level}\n` +
                        `**Experience:** ${pet.experience}/100\n\n` +
                        `**Current Stats:**\n` +
                        `• Happiness: ${pet.happiness}/100\n` +
                        `• Energy: ${pet.energy}/100\n` +
                        `• Hunger: ${pet.hunger}/100\n\n` +
                        `**Overall Condition:** ${getCondition(pet.happiness, pet.energy, pet.hunger)}\n\n` +
                        `**Care Commands:**\n` +
                        `• \`/pets feed\` (3 coins)\n` +
                        `• \`/pets play\` (2 coins)\n` +
                        `• \`/pets sleep\` (1 coin)\n` +
                        `• \`/pets train\` (5 coins)`
                    );

                return message.reply({ embeds: [statusEmbed] });

            case 'feed':
            case 'play':
            case 'sleep':
            case 'train':
                if (!petData) {
                    return message.reply("🐾 You need a pet first! Use `/pets adopt` to get one.");
                }

                const activity = activities.find(a => a.name === subcommand);
                const currentCoins = storage === 'db' ? user.coins : user.coins;

                if (currentCoins < activity.cost) {
                    return message.reply(`💸 You need ${activity.cost} coins to ${subcommand} your pet!`);
                }

                const userPet = petData;

                // Apply activity effects
                userPet.hunger = Math.max(0, Math.min(100, userPet.hunger + activity.hungerChange));
                userPet.happiness = Math.max(0, Math.min(100, userPet.happiness + activity.happinessChange));
                userPet.energy = Math.max(0, Math.min(100, userPet.energy + activity.energyChange));
                userPet.lastCared = Date.now();
                userPet.experience += 5;

                // Level up check
                if (userPet.experience >= 100) {
                    userPet.level++;
                    userPet.experience = 0;
                }

                // Update database or JSON
                if (storage === 'db') {
                    try {
                        // Deduct coins
                        await database.updateUserCoins(userId, -activity.cost);
                        
                        // Update pet data in database stats
                        await database.updateUserStats(userId, {
                            pet: userPet
                        });

                        const newBalance = currentCoins - activity.cost;

                        const activityEmbed = new EmbedBuilder()
                            .setTitle(`${userPet.emoji} Pet Care: ${subcommand.charAt(0).toUpperCase() + subcommand.slice(1)}`)
                            .setColor(0x3498db)
                            .setDescription(
                                `${activity.message}\n\n` +
                                `**Cost:** ${activity.cost} coins\n` +
                                `**Remaining Balance:** ${newBalance} coins\n\n` +
                                `**Updated Stats:**\n` +
                                `• Happiness: ${userPet.happiness}/100\n` +
                                `• Energy: ${userPet.energy}/100\n` +
                                `• Hunger: ${userPet.hunger}/100\n` +
                                `• Level: ${userPet.level} (${userPet.experience}/100 XP)`
                            );

                        return message.reply({ embeds: [activityEmbed] });
                    } catch (error) {
                        console.error('Error performing pet activity in database:', error);
                        return message.reply('❌ Failed to perform activity. Please try again.');
                    }
                } else {
                    // JSON fallback
                    const userData = loadUserData();
                    userData[userId].coins -= activity.cost;
                    userData[userId].pet = userPet;
                    saveUserData(userData);

                    const activityEmbed = new EmbedBuilder()
                        .setTitle(`${userPet.emoji} Pet Care: ${subcommand.charAt(0).toUpperCase() + subcommand.slice(1)}`)
                        .setColor(0x3498db)
                        .setDescription(
                            `${activity.message}\n\n` +
                            `**Cost:** ${activity.cost} coins\n` +
                            `**Remaining Balance:** ${userData[userId].coins} coins\n\n` +
                            `**Updated Stats:**\n` +
                            `• Happiness: ${userPet.happiness}/100\n` +
                            `• Energy: ${userPet.energy}/100\n` +
                            `• Hunger: ${userPet.hunger}/100\n` +
                            `• Level: ${userPet.level} (${userPet.experience}/100 XP)`
                        );

                    return message.reply({ embeds: [activityEmbed] });
                }

            default:
                return message.reply("🐾 Use `adopt`, `status`, `feed`, `play`, `sleep`, or `train` with the pets command!");
        }
    }
};
