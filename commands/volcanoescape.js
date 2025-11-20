const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

module.exports = {
    name: 'volcanoescape',
    aliases: ['escape', 'volcano'],
    description: 'Test your reflexes and escape the erupting Panfu volcano!',

    data: new SlashCommandBuilder()
        .setName('volcanoescape')
        .setDescription('Test your reflexes and escape the erupting Panfu volcano!'),

    async execute(message, args, client) {
        const reward = 10; // coins for survivors
        await message.reply("🌋 **The Panfu Volcano is about to erupt!** React fast to survive…");

        // We'll send 3–5 random "JUMP" prompts, each with a very short timer.
        const rounds = Math.floor(Math.random() * 3) + 3; // 3–5 rounds
        const survivors = new Set();

        for (let i = 0; i < rounds; i++) {
            const delay = Math.floor(Math.random() * 4000) + 2000; // 2–6 sec between prompts
            await new Promise(res => setTimeout(res, delay));

            const prompt = await message.channel.send(`🔥 **ROUND ${i + 1}!** Click 🟢 to JUMP! You have 3 seconds!`);
            await prompt.react('🟢');

            const filter = (reaction, user) =>
                !user.bot && reaction.emoji.name === '🟢';

            try {
                const collected = await prompt.awaitReactions({ filter, time: 3000 });

                // Everyone who reacted in time survives this round
                collected.get('🟢')?.users.cache.forEach(u => survivors.add(u.id));
            } catch (error) {
                console.log('Reaction collection ended');
            }
        }

        if (survivors.size === 0) {
            return message.channel.send("💀 The lava claimed everyone. Better luck next eruption.");
        }

        // Reward survivors - try database first
        if (database && database.isInitialized()) {
            try {
                for (const id of survivors) {
                    // Fetch real username from Discord
                    const discordUser = await client.users.fetch(id).catch(() => null);
                    const username = discordUser ? discordUser.username : 'Panda';
                    await database.getUserProfile(id, username);
                    await database.updateUserCoins(id, reward);
                }
            } catch (error) {
                console.log('Database failed for volcano rewards, using JSON fallback:', error.message);
                // Fall through to JSON fallback below
                const userData = loadUserData();
                survivors.forEach(id => {
                    if (!userData[id]) {
                        userData[id] = {
                            panda: { name: `User's Panda`, color: 'Black & White', accessories: 'None' },
                            coins: 50, level: 1, experience: 0,
                            stats: { friendship: 10, energy: 100, happiness: 75 },
                            daily: { lastClaimed: null, streak: 0 },
                            joinedAt: new Date().toISOString()
                        };
                    }
                    userData[id].coins += reward;
                });
                saveUserData(userData);
            }
        } else {
            // JSON fallback
            const userData = loadUserData();
            survivors.forEach(id => {
                if (!userData[id]) {
                    userData[id] = {
                        panda: { name: `User's Panda`, color: 'Black & White', accessories: 'None' },
                        coins: 50, level: 1, experience: 0,
                        stats: { friendship: 10, energy: 100, happiness: 75 },
                        daily: { lastClaimed: null, streak: 0 },
                        joinedAt: new Date().toISOString()
                    };
                }
                userData[id].coins += reward;
            });
            saveUserData(userData);
        }

        const mentions = Array.from(survivors).map(id => `<@${id}>`).join(', ');
        const embed = new EmbedBuilder()
            .setTitle("🏆 Volcano Escape Results")
            .setColor(0xe74c3c)
            .setDescription(
                `Survivors (${survivors.size}) earned **${reward} coins** each!\n\n` +
                `${mentions}`
            );

        await message.channel.send({ embeds: [embed] });
    }
};
