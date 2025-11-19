const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadUserData, saveUserData } = require("../utils/storage");

// Import database utilities  
const database = require('../utils/database');

await interaction.deferReply();

// Friendship activities and their effects
const friendshipActivities = [
    { name: "hangout", description: "spend quality time together", points: 5, cost: 0 },
    { name: "gift", description: "give a thoughtful present", points: 10, cost: 5 },
    { name: "adventure", description: "go on an epic quest together", points: 15, cost: 8 }
];

// Friendship level titles
const friendshipLevels = [
    { level: 1, title: "Strangers", min: 0, max: 19 },
    { level: 2, title: "Acquaintances", min: 20, max: 49 },
    { level: 3, title: "Friends", min: 50, max: 99 },
    { level: 4, title: "Good Friends", min: 100, max: 174 },
    { level: 5, title: "Close Friends", min: 175, max: 274 },
    { level: 6, title: "Best Friends", min: 275, max: 399 },
    { level: 7, title: "Inseparable", min: 400, max: 549 },
    { level: 8, title: "Soulmates", min: 550, max: 749 },
    { level: 9, title: "Eternal Bond", min: 750, max: 999 },
    { level: 10, title: "Legendary Duo", min: 1000, max: Infinity }
];

function getFriendshipLevel(points) {
    return friendshipLevels.find(level => points >= level.min && points <= level.max);
}

module.exports = {
    name: 'friendship',
    aliases: ['friend', 'friends'],
    description: 'Build and manage friendships with other pandas',

    data: new SlashCommandBuilder()
        .setName("friendship")
        .setDescription("Build and manage friendships with other pandas")
        .addSubcommand(sub =>
            sub.setName("check")
                .setDescription("Check friendship level with another panda")
                .addUserOption(opt =>
                    opt.setName("user")
                        .setDescription("Panda to check friendship with")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("hangout")
                .setDescription("Hang out with a friend (free)")
                .addUserOption(opt =>
                    opt.setName("user")
                        .setDescription("Friend to hang out with")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("gift")
                .setDescription("Give a gift to strengthen friendship (costs 5 coins)")
                .addUserOption(opt =>
                    opt.setName("user")
                        .setDescription("Friend to give gift to")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("adventure")
                .setDescription("Go on an adventure together (costs 8 coins)")
                .addUserOption(opt =>
                    opt.setName("user")
                        .setDescription("Friend to adventure with")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("leaderboard")
                .setDescription("View your top friendships")
        ),

    async execute(message, args, client) {
        const userId = message.author.id;
        const subcommand = args[0];
        const targetUser = args[1];

        let storage = (database && database.isInitialized()) ? 'db' : 'json';
        let user;
        let friendships = {};

        // Get user data from database or JSON fallback
        if (storage === 'db') {
            try {
                user = await database.getUserProfile(userId, message.author.username);
                if (!user) throw new Error('Database unavailable');
                
                // Get friendships from database stats field if available
                if (user.stats && user.stats.friendships !== undefined) {
                    friendships = user.stats.friendships || {};
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
                    coins: 50,
                    friendships: {}
                };
                saveUserData(userData);
            }
            if (!userData[userId].friendships) {
                userData[userId].friendships = {};
            }
            user = userData[userId];
            friendships = userData[userId].friendships;
        }

        switch (subcommand) {
            case "check": {
                const friend = targetUser;
                if (!friend) {
                    return message.reply({ content: "👫 Please select a valid user!" });
                }
                if (friend.id === userId) {
                    return message.reply("🤔 You can't check friendship with yourself!");
                }

                const friendshipPoints = friendships[friend.id] || 0;
                const friendshipLevel = getFriendshipLevel(friendshipPoints);
                const nextLevel = friendshipLevels.find(level => level.min > friendshipPoints);

                const embed = new EmbedBuilder()
                    .setTitle("👫 Friendship Status")
                    .setColor(0xe91e63)
                    .setDescription(
                        `**${message.author}** ↔️ **${friend}**\n\n` +
                        `**Friendship Level:** ${friendshipLevel.level} - ${friendshipLevel.title}\n` +
                        `**Friendship Points:** ${friendshipPoints}\n` +
                        `**Progress to Next Level:** ${nextLevel ? `${friendshipPoints}/${nextLevel.min}` : "MAX LEVEL!"}`
                    );

                return message.reply({ embeds: [embed] });
            }

            case "hangout":
            case "gift":
            case "adventure": {
                const friend = targetUser;
                if (!friend || friend.id === userId) {
                    return message.reply("👫 Pick a valid friend (not yourself)!");
                }

                const activity = friendshipActivities.find(a => a.name === subcommand);
                const userCoins = storage === 'db' ? user.coins : user.coins;

                if (activity.cost > 0 && userCoins < activity.cost) {
                    return message.reply(`💸 You need ${activity.cost} coins to ${activity.name} with your friend!`);
                }

                // Update points for both users
                if (!friendships[friend.id]) friendships[friend.id] = 0;
                friendships[friend.id] += activity.points;

                // Get friend's data
                let friendStorage = (database && database.isInitialized()) ? 'db' : 'json';
                let friendUser;
                let friendFriendships = {};

                if (friendStorage === 'db') {
                    try {
                        friendUser = await database.getUserProfile(friend.id, friend.username);
                        if (friendUser && friendUser.stats && friendUser.stats.friendships) {
                            friendFriendships = friendUser.stats.friendships || {};
                        }
                    } catch (error) {
                        friendStorage = 'json';
                    }
                }

                if (friendStorage === 'json') {
                    const userData = loadUserData();
                    if (!userData[friend.id]) {
                        userData[friend.id] = { coins: 50, friendships: {} };
                    }
                    if (!userData[friend.id].friendships) {
                        userData[friend.id].friendships = {};
                    }
                    friendFriendships = userData[friend.id].friendships;
                }

                if (!friendFriendships[userId]) friendFriendships[userId] = 0;
                friendFriendships[userId] += activity.points;

                // Update database or JSON for both users
                if (storage === 'db') {
                    try {
                        // Deduct coins if needed
                        if (activity.cost > 0) {
                            await database.updateUserCoins(userId, -activity.cost);
                        }
                        
                        // Update friendships
                        await database.updateUserStats(userId, {
                            friendships: friendships
                        });

                        // Update friend's friendships
                        if (friendStorage === 'db') {
                            await database.updateUserStats(friend.id, {
                                friendships: friendFriendships
                            });
                        } else {
                            const userData = loadUserData();
                            userData[friend.id].friendships = friendFriendships;
                            saveUserData(userData);
                        }

                        const newBalance = activity.cost > 0 ? userCoins - activity.cost : userCoins;
                        const newLevel = getFriendshipLevel(friendships[friend.id]);

                        const embed = new EmbedBuilder()
                            .setTitle(`👫 Friendship Activity: ${activity.name}`)
                            .setColor(0x2ecc71)
                            .setDescription(
                                `**${message.author}** and **${friend}** ${activity.description}!\n\n` +
                                `**Friendship Points Gained:** +${activity.points}\n` +
                                `**Total Friendship Points:** ${friendships[friend.id]}\n` +
                                `**Friendship Level:** ${newLevel.level} - ${newLevel.title}\n` +
                                (activity.cost > 0 ? `**Cost:** ${activity.cost} coins\nRemaining Balance: ${newBalance} coins` : "")
                            );

                        return message.reply({ embeds: [embed] });
                    } catch (error) {
                        console.error('Error updating friendship in database:', error);
                        return message.reply('❌ Failed to update friendship. Please try again.');
                    }
                } else {
                    // JSON fallback
                    const userData = loadUserData();
                    if (activity.cost > 0) userData[userId].coins -= activity.cost;
                    userData[userId].friendships = friendships;
                    userData[friend.id].friendships = friendFriendships;
                    saveUserData(userData);

                    const newLevel = getFriendshipLevel(friendships[friend.id]);

                    const embed = new EmbedBuilder()
                        .setTitle(`👫 Friendship Activity: ${activity.name}`)
                        .setColor(0x2ecc71)
                        .setDescription(
                            `**${message.author}** and **${friend}** ${activity.description}!\n\n` +
                            `**Friendship Points Gained:** +${activity.points}\n` +
                            `**Total Friendship Points:** ${friendships[friend.id]}\n` +
                            `**Friendship Level:** ${newLevel.level} - ${newLevel.title}\n` +
                            (activity.cost > 0 ? `**Cost:** ${activity.cost} coins\nRemaining Balance: ${userData[userId].coins} coins` : "")
                        );

                    return message.reply({ embeds: [embed] });
                }
            }

            case "leaderboard": {
                if (Object.keys(friendships).length === 0) {
                    return message.reply("👫 You haven't built any friendships yet!");
                }

                const sorted = Object.entries(friendships)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10);

                const leaderboard = await Promise.all(
                    sorted.map(async ([fid, points], idx) => {
                        const friend = await client.users.fetch(fid).catch(() => null);
                        const friendName = friend ? friend.username : "Unknown User";
                        const level = getFriendshipLevel(points);
                        return `${idx + 1}. **${friendName}** - ${points} points (${level.title})`;
                    })
                );

                const embed = new EmbedBuilder()
                    .setTitle(`👫 ${message.author.username}'s Friendship Leaderboard`)
                    .setColor(0xe91e63)
                    .setDescription(leaderboard.join("\n"));

                return message.reply({ embeds: [embed] });
            }

            default:
                return message.reply("👫 Use `check`, `hangout`, `gift`, `adventure`, or `leaderboard`!");
        }
    }
};
