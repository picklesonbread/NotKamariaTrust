const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData } = require('../utils/storage');
const database = require('../utils/database');

module.exports = {
    name: 'inventory',
    description: 'View your complete collection of fish, items, stamps, and artifacts!',

    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your complete collection of fish, items, stamps, and artifacts!')
        .addSubcommand(sub =>
            sub.setName('all')
                .setDescription('View your entire inventory')
        )
        .addSubcommand(sub =>
            sub.setName('fish')
                .setDescription('View all fish you\'ve caught')
        )
        .addSubcommand(sub =>
            sub.setName('items')
                .setDescription('View all items you own')
        )
        .addSubcommand(sub =>
            sub.setName('stamps')
                .setDescription('View your stamp collection')
        )
        .addSubcommand(sub =>
            sub.setName('artifacts')
                .setDescription('View your time travel artifacts')
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const subcommand = interaction.options.getSubcommand();

        let storage = (database && database.isInitialized()) ? 'db' : 'json';
        let user;

        // Get user data from database or JSON fallback
        if (storage === 'db') {
            try {
                user = await database.getUserProfile(userId, username);
                if (!user) throw new Error('Database unavailable');
            } catch (error) {
                console.log('Database error, falling back to JSON storage:', error.message);
                storage = 'json';
            }
        }

        if (storage === 'json') {
            const userData = loadUserData();
            if (!userData[userId]) {
                return interaction.reply({
                    content: '🐼 You haven\'t started your Panfu journey yet! Try fishing, shopping, or exploring first!',
                    ephemeral: true
                });
            }
            user = userData[userId];
        }

        switch (subcommand) {
            case 'all':
                return this.showAllInventory(interaction, user, username);
            case 'fish':
                return this.showFishCollection(interaction, user, username);
            case 'items':
                return this.showItems(interaction, user, username);
            case 'stamps':
                return this.showStamps(interaction, user, username);
            case 'artifacts':
                return this.showArtifacts(interaction, user, username);
        }
    },

    showAllInventory(interaction, user, username) {
        const embed = new EmbedBuilder()
            .setTitle(`🎒 ${username}'s Complete Inventory`)
            .setColor('#9b59b6')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription('Your complete collection of fish, items, stamps, and artifacts!');

        // Count totals - check both database (fish_caught) and JSON (fishCaught) for backwards compatibility
        const fishCaught = user.fish_caught || user.fishCaught || {};
        const fishCount = Object.keys(fishCaught).length;
        const fishTotal = Object.values(fishCaught).reduce((a, b) => a + b, 0);
        
        const itemCount = user.inventory ? Object.keys(user.inventory).length : 0;
        const itemTotal = user.inventory ? Object.values(user.inventory).reduce((a, b) => a + b, 0) : 0;
        
        const stampCount = user.stamps?.collection ? Object.keys(user.stamps.collection).length : 0;
        const stampTotal = user.stamps?.collection ? Object.values(user.stamps.collection).reduce((a, b) => a + b, 0) : 0;
        
        // Check both database (stats.timetravel_artifacts) and JSON (timetravel.artifacts) for backwards compatibility
        const timetravelArtifacts = (user.stats?.timetravel_artifacts) || user.timetravel?.artifacts || [];
        const artifactCount = timetravelArtifacts.length;

        embed.addFields(
            { 
                name: '🐟 Fish Collection', 
                value: fishCount > 0 ? `${fishCount} unique species (${fishTotal} total caught)` : 'No fish caught yet', 
                inline: true 
            },
            { 
                name: '🎁 Items', 
                value: itemCount > 0 ? `${itemCount} unique items (${itemTotal} total)` : 'No items owned', 
                inline: true 
            },
            { 
                name: '📮 Stamps', 
                value: stampCount > 0 ? `${stampCount} unique stamps (${stampTotal} total)` : 'No stamps collected', 
                inline: true 
            },
            { 
                name: '🏺 Artifacts', 
                value: artifactCount > 0 ? `${artifactCount} unique artifacts` : 'No artifacts found', 
                inline: true 
            }
        );

        embed.setFooter({ text: 'Use /inventory [category] to see detailed lists!' });

        return interaction.reply({ embeds: [embed] });
    },

    showFishCollection(interaction, user, username) {
        // Check both database (fish_caught) and JSON (fishCaught) for backwards compatibility
        const fishCaught = user.fish_caught || user.fishCaught || {};
        const fishList = Object.entries(fishCaught);

        if (fishList.length === 0) {
            return interaction.reply({
                content: '🎣 You haven\'t caught any fish yet! Use `/fish` to start fishing!',
                ephemeral: true
            });
        }

        // Sort by count (most caught first)
        fishList.sort((a, b) => b[1] - a[1]);

        const embed = new EmbedBuilder()
            .setTitle(`🐟 ${username}'s Fish Collection`)
            .setColor('#3498db')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`You've caught ${fishList.length} unique species!`);

        // Group fish into chunks for better display
        const fishDisplay = fishList.slice(0, 25).map(([name, count]) => {
            return `**${name}** - Caught ${count}x`;
        }).join('\n');

        embed.addFields({
            name: '🎣 Your Catches',
            value: fishDisplay || 'No fish yet!',
            inline: false
        });

        const totalCaught = fishList.reduce((sum, [_, count]) => sum + count, 0);
        embed.setFooter({ text: `Total fish caught: ${totalCaught} | Keep fishing to catch them all!` });

        return interaction.reply({ embeds: [embed] });
    },

    showItems(interaction, user, username) {
        const inventory = user.inventory || {};
        const itemList = Object.entries(inventory);

        if (itemList.length === 0) {
            return interaction.reply({
                content: '🎁 You don\'t have any items yet! Visit the `/shop` or explore to find items!',
                ephemeral: true
            });
        }

        // Sort by quantity (most owned first)
        itemList.sort((a, b) => b[1] - a[1]);

        const embed = new EmbedBuilder()
            .setTitle(`🎒 ${username}'s Items`)
            .setColor('#e67e22')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`You own ${itemList.length} unique items!`);

        // Show items
        const itemDisplay = itemList.slice(0, 25).map(([name, count]) => {
            return `**${name}** - Owned ${count}x`;
        }).join('\n');

        embed.addFields({
            name: '🎁 Your Items',
            value: itemDisplay || 'No items yet!',
            inline: false
        });

        const totalItems = itemList.reduce((sum, [_, count]) => sum + count, 0);
        embed.setFooter({ text: `Total items owned: ${totalItems}` });

        return interaction.reply({ embeds: [embed] });
    },

    showStamps(interaction, user, username) {
        const stamps = user.stamps?.collection || {};
        const stampList = Object.entries(stamps);

        if (stampList.length === 0) {
            return interaction.reply({
                content: '📮 You haven\'t collected any stamps yet! Use `/stamps hunt` to find stamps!',
                ephemeral: true
            });
        }

        // Sort by count
        stampList.sort((a, b) => b[1] - a[1]);

        const embed = new EmbedBuilder()
            .setTitle(`📮 ${username}'s Stamp Collection`)
            .setColor('#e74c3c')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`You've collected ${stampList.length} unique stamps!`);

        const stampDisplay = stampList.slice(0, 25).map(([name, count]) => {
            return `**${name}** - Collected ${count}x`;
        }).join('\n');

        embed.addFields({
            name: '📮 Your Stamps',
            value: stampDisplay || 'No stamps yet!',
            inline: false
        });

        const totalStamps = stampList.reduce((sum, [_, count]) => sum + count, 0);
        embed.setFooter({ text: `Total stamps: ${totalStamps}` });

        return interaction.reply({ embeds: [embed] });
    },

    showArtifacts(interaction, user, username) {
        // Check both database (stats.timetravel_artifacts) and JSON (timetravel.artifacts) for backwards compatibility
        const artifacts = (user.stats?.timetravel_artifacts) || user.timetravel?.artifacts || [];

        if (artifacts.length === 0) {
            return interaction.reply({
                content: '🏺 You haven\'t found any artifacts yet! Use `/timetravel` to discover ancient treasures!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🏺 ${username}'s Artifact Collection`)
            .setColor('#f39c12')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`You've discovered ${artifacts.length} unique artifacts from different eras!`);

        const artifactDisplay = artifacts.slice(0, 25).map((artifact, index) => {
            return `${index + 1}. **${artifact}**`;
        }).join('\n');

        embed.addFields({
            name: '🏺 Your Artifacts',
            value: artifactDisplay || 'No artifacts yet!',
            inline: false
        });

        const totalTrips = user.timetravel?.trips || 0;
        embed.setFooter({ text: `Total time travel trips: ${totalTrips}` });

        return interaction.reply({ embeds: [embed] });
    }
};
