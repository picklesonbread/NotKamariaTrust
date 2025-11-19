const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

module.exports = {
    name: 'bananabet',
    aliases: ['bet', 'coinflip'],
    description: 'Challenge another panda to a coin flip bet!',

    data: new SlashCommandBuilder()
        .setName('bananabet')
        .setDescription('Challenge another panda to a coin flip bet!')
        .addUserOption(opt =>
            opt.setName('opponent')
                .setDescription('The panda you want to challenge')
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName('amount')
                .setDescription('Number of coins to wager')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction, args, client) {
        // Handle slash command interactions
        const challenger = interaction.user;
        const opponent = interaction.options?.getUser('opponent');
        const amount = interaction.options?.getInteger('amount');

        if (!opponent || !amount) {
            return interaction.reply({ content: 'Usage: `/bananabet @user [amount]`', ephemeral: true });
        }

        if (opponent.bot) {
            return interaction.reply({ content: "🤖 Nice try, but bots don't gamble bananas.", ephemeral: true });
        }
        if (opponent.id === challenger.id) {
            return interaction.reply({ content: "You can't bet against yourself, lone wolf.", ephemeral: true });
        }

        const userData = loadUserData();

        // Initialize user data if needed
        if (!userData[challenger.id]) {
            userData[challenger.id] = {
                panda: {
                    name: `${challenger.username}'s Panda`,
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
        }

        if (!userData[opponent.id]) {
            userData[opponent.id] = {
                panda: {
                    name: `${opponent.username}'s Panda`,
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
        }

        // Check balance from database if available, otherwise use JSON
        let challengerCoins = userData[challenger.id].coins;
        let opponentCoins = userData[opponent.id].coins;

        if (database && database.isInitialized()) {
            try {
                const challengerData = await database.getUserProfile(challenger.id, challenger.username);
                const opponentData = await database.getUserProfile(opponent.id, opponent.username);
                if (challengerData) challengerCoins = challengerData.coins;
                if (opponentData) opponentCoins = opponentData.coins;
            } catch (error) {
                console.log('Database balance check failed, using JSON:', error.message);
            }
        }

        if (challengerCoins < amount) {
            return interaction.reply({ content: `You only have ${challengerCoins} coins. Poor panda.`, ephemeral: true });
        }
        if (opponentCoins < amount) {
            return interaction.reply({ content: `${opponent.username} doesn't have enough coins to match the bet.`, ephemeral: true });
        }

        // Ask opponent to accept
        await interaction.reply(
            `${opponent}, do you accept **${amount} coins** bet from ${challenger}? Type **yes** or **no** within 30 seconds.`
        );

        const filter = m => !m.author.bot && m.author.id === opponent.id;
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30_000 });

        if (!collected.size || collected.first().content.toLowerCase() !== 'yes') {
            return interaction.followUp(`${opponent} declined or timed out. No bananas lost.`);
        }

        // Flip a banana coin
        const winner = Math.random() < 0.5 ? challenger : opponent;
        const loser = winner.id === challenger.id ? opponent : challenger;

        let winnerBalance = 0;
        let loserBalance = 0;

        // Try database first
        if (database && database.isInitialized()) {
            try {
                await database.updateUserCoins(winner.id, amount);
                await database.updateUserCoins(loser.id, -amount);
                const winnerData = await database.getUserProfile(winner.id, winner.username);
                const loserData = await database.getUserProfile(loser.id, loser.username);
                winnerBalance = winnerData.coins;
                loserBalance = loserData.coins;

                const embed = new EmbedBuilder()
                    .setTitle("🍌 Banana Bet Results")
                    .setColor(0xf1c40f)
                    .setDescription(
                        `The banana spins in the air… and lands for **${winner}!**\n\n` +
                        `💰 **${amount} coins** transferred from ${loser} to ${winner}.\n` +
                        `Balances:\n` +
                        `• ${challenger.username}: ${challenger.id === winner.id ? winnerBalance : loserBalance} coins\n` +
                        `• ${opponent.username}: ${opponent.id === winner.id ? winnerBalance : loserBalance} coins`
                    );

                return await interaction.followUp({ embeds: [embed] });
            } catch (error) {
                console.log('Database failed for bananabet, using JSON fallback:', error.message);
            }
        }

        // JSON fallback
        userData[winner.id].coins += amount;
        userData[loser.id].coins -= amount;
        saveUserData(userData);

        const embed = new EmbedBuilder()
            .setTitle("🍌 Banana Bet Results")
            .setColor(0xf1c40f)
            .setDescription(
                `The banana spins in the air… and lands for **${winner}!**\n\n` +
                `💰 **${amount} coins** transferred from ${loser} to ${winner}.\n` +
                `Balances:\n` +
                `• ${challenger.username}: ${userData[challenger.id].coins} coins\n` +
                `• ${opponent.username}: ${userData[opponent.id].coins} coins`
            );

        await interaction.followUp({ embeds: [embed] });
    }
};