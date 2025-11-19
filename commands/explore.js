const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

await interaction.deferReply();

// Real Panfu locations
const LOCATIONS = {
    beach: {
        name: '🏖️ Panfu Beach',
        description: 'Golden sand and crystal blue waters',
        emoji: '🏖️'
    },
    volcano: {
        name: '🌋 Volcano',
        description: 'Hot lava flows and steaming vents',
        emoji: '🌋'
    },
    disco: {
        name: '🪩 Disco Dome',
        description: 'The legendary dance floor with flashing lights',
        emoji: '🪩'
    },
    lighthouse: {
        name: '🗼 Lighthouse',
        description: 'Towering beacon overlooking the ocean',
        emoji: '🗼'
    },
    castle: {
        name: '🏰 Castle',
        description: 'Ancient stone fortress with secret passages',
        emoji: '🏰'
    },
    jungle: {
        name: '🌴 Jungle',
        description: 'Dense tropical rainforest full of mystery',
        emoji: '🌴'
    },
    dojo: {
        name: '🥋 Dojo',
        description: 'Training ground for martial arts masters',
        emoji: '🥋'
    },
    bamboo: {
        name: '🎋 Bamboo Forest',
        description: 'Peaceful grove of towering bamboo',
        emoji: '🎋'
    },
    treehouse: {
        name: '🏡 Treehouse',
        description: 'Cozy hideout high in the canopy',
        emoji: '🏡'
    },
    mine: {
        name: '⛏️ Mine',
        description: 'Dark tunnels full of hidden treasures',
        emoji: '⛏️'
    }
};

// Real Panfu NPCs with their personalities (all authentic characters from Panfu Wiki)
const NPCS = [
    { 
        name: 'Kamaria', 
        role: 'Mystical Witch',
        greeting: 'Ah, another wanderer seeking wisdom... or coins. Mostly coins.',
        gifts: ['Ancient Scroll', 'Mystic Crystal', 'Fortune Cookie'],
        coins: [20, 50]
    },
    { 
        name: 'Bruno', 
        role: 'Mountain Explorer',
        greeting: 'Hey there! I found something interesting on my last expedition!',
        gifts: ['Climbing Rope', 'Mountain Map', 'Energy Bar'],
        coins: [15, 40]
    },
    { 
        name: 'Gonzo', 
        role: 'Black Market Dealer',
        greeting: '*whispers* Psst... wanna buy some "totally legal" stuff?',
        gifts: ['Suspicious Package', 'Mystery Box', 'Shady Coins'],
        coins: [30, 70]
    },
    { 
        name: 'Max', 
        role: 'Panfu Reporter',
        greeting: 'Yo! Ready for an adventure? I just got back from the coolest place!',
        gifts: ['Adventure Map', 'Compass', 'Backpack'],
        coins: [10, 35]
    },
    { 
        name: 'Ella', 
        role: 'Panfu Reporter',
        greeting: 'Welcome! Here, I have a little something for you!',
        gifts: ['Homemade Cookies', 'Warm Scarf', 'Gift Basket'],
        coins: [12, 30]
    },
    { 
        name: 'Troy', 
        role: 'Pancake Salesman',
        greeting: 'Fresh pancakes! Oh, and I found this while flipping pancakes...',
        gifts: ['Pancake Mix', 'Frying Pan', 'Chef Hat'],
        coins: [8, 25]
    },
    { 
        name: 'Farid', 
        role: 'Desert Trader',
        greeting: 'Greetings, traveler! The sands have been generous today.',
        gifts: ['Silk Scarf', 'Spice Pouch', 'Ancient Coin'],
        coins: [18, 45]
    },
    { 
        name: 'Eloise', 
        role: 'Fashion Designer',
        greeting: 'Darling! You simply must have this fabulous find!',
        gifts: ['Stylish Hat', 'Fashion Magazine', 'Designer Scarf'],
        coins: [10, 28]
    },
    { 
        name: 'DJ Pandi', 
        role: 'Disco DJ',
        greeting: '♪ Yo yo yo! Check out this sick beat... I mean, sick treasure! ♪',
        gifts: ['Vinyl Record', 'Disco Ball', 'Headphones'],
        coins: [15, 38]
    },
    { 
        name: 'Lenny', 
        role: 'Bamboo Farmer',
        greeting: 'Fresh bamboo harvest today! Here, take some extras!',
        gifts: ['Bamboo Shoots', 'Gardening Tools', 'Seed Pack'],
        coins: [5, 20]
    },
    { 
        name: 'Hamelot', 
        role: 'Castle Chronicler',
        greeting: 'Fascinating! I just discovered this in the royal archives!',
        gifts: ['Old Manuscript', 'Royal Seal', 'History Book'],
        coins: [12, 32]
    },
    { 
        name: 'Carl Caruso', 
        role: 'Adventurer',
        greeting: 'Hey! You look like someone who appreciates adventure treasures!',
        gifts: ['Explorer Badge', 'Ancient Artifact', 'Travel Journal'],
        coins: [20, 50]
    },
    { 
        name: 'Horst Hering', 
        role: 'Old Sailor',
        greeting: '*adjusts captain hat* Ahoy! The sea brought me this today.',
        gifts: ['Ship in a Bottle', 'Fishing Net', 'Sailor Hat'],
        coins: [14, 35]
    },
    { 
        name: 'Momo', 
        role: 'Band Guitarist',
        greeting: 'Dude! Check out what I found backstage at The Smashing Pancakes gig!',
        gifts: ['Guitar Pick', 'Band Poster', 'Concert Ticket'],
        coins: [12, 30]
    },
    { 
        name: 'Bonez', 
        role: 'Money-Obsessed Schemer',
        greeting: 'I suppose I can spare this... for the right price. Wait, you want it free?!',
        gifts: ['Stolen Coins', 'Shiny Ring', 'Gold Bar'],
        coins: [25, 60]
    }
];

// Random encounter types
const ENCOUNTERS = {
    COIN_FIND: {
        type: 'coins',
        messages: [
            'You spot something shiny in the distance...',
            'You stumble upon a hidden stash!',
            'A generous panda dropped their wallet here!',
            'You found a secret coin cache!',
            'Treasure! Just lying there!'
        ],
        amounts: [10, 15, 20, 25, 30, 35, 40, 50, 75, 100]
    },
    ITEM_FIND: {
        type: 'item',
        items: [
            { name: 'Shiny Pebble', value: 5, emoji: '💎' },
            { name: 'Lost Tambourine', value: 12, emoji: '🪘' },
            { name: 'Broken Disco Ball', value: 8, emoji: '🪩' },
            { name: 'Ancient Artifact', value: 25, emoji: '🏺' },
            { name: 'Golden Banana', value: 20, emoji: '🍌' },
            { name: 'Rare Stamp', value: 30, emoji: '📮' },
            { name: 'Mysterious Map', value: 18, emoji: '🗺️' },
            { name: 'Lucky Charm', value: 15, emoji: '🍀' },
            { name: 'Vintage Postcard', value: 10, emoji: '📬' },
            { name: 'Crystal Fragment', value: 22, emoji: '💠' }
        ]
    },
    NPC_MEET: {
        type: 'npc'
    }
};

// Location-specific events
const LOCATION_EVENTS = {
    beach: [
        { event: 'You help Troy rescue a beached dolphin!', coins: 35, emoji: '🐬' },
        { event: 'You build an amazing sandcastle that attracts tourists!', coins: 20, emoji: '🏖️' },
        { event: 'You find a message in a bottle with a treasure map!', coins: 45, emoji: '📜' }
    ],
    volcano: [
        { event: 'You help Bruno collect rare volcanic crystals!', coins: 50, emoji: '💎' },
        { event: 'You warn pandas about an incoming eruption! Heroic!', coins: 60, emoji: '🌋' },
        { event: 'You discover a hot spring and charge admission!', coins: 40, emoji: '♨️' }
    ],
    disco: [
        { event: 'You win an impromptu dance battle! The crowd loves you!', coins: 35, emoji: '💃' },
        { event: 'DJ Pandi asks you to help with the sound system and tips you!', coins: 45, emoji: '🎧' },
        { event: 'You find lost coins under the dance floor!', coins: 30, emoji: '🪩' }
    ],
    lighthouse: [
        { event: 'You help the lighthouse keeper fix the beacon!', coins: 40, emoji: '💡' },
        { event: 'You spot a ship in trouble and save them!', coins: 55, emoji: '🚢' },
        { event: 'You organize a lighthouse tour for tourists!', coins: 35, emoji: '🗼' }
    ],
    castle: [
        { event: 'Hamelot pays you to help organize the royal archives!', coins: 38, emoji: '📚' },
        { event: 'You discover a secret passage with treasure!', coins: 65, emoji: '🏰' },
        { event: 'You help defend the castle in a pretend battle!', coins: 42, emoji: '⚔️' }
    ],
    jungle: [
        { event: 'You discover a hidden waterfall oasis!', coins: 48, emoji: '💦' },
        { event: 'You help Max navigate through dense vines!', coins: 32, emoji: '🌴' },
        { event: 'You find rare jungle fruits and sell them!', coins: 38, emoji: '🥭' }
    ],
    dojo: [
        { event: 'You complete an intensive training session at the dojo!', coins: 50, emoji: '🥋' },
        { event: 'You win a sparring match against a black belt!', coins: 45, emoji: '🥷' },
        { event: 'You meditate and find inner peace... and coins!', coins: 30, emoji: '🧘' }
    ],
    bamboo: [
        { event: 'You help Lenny with the bamboo harvest!', coins: 28, emoji: '🎋' },
        { event: 'You discover a rare golden bamboo shoot!', coins: 55, emoji: '✨' },
        { event: 'You play a peaceful flute concert for pandas!', coins: 35, emoji: '🎵' }
    ],
    treehouse: [
        { event: 'You repair the treehouse roof before rain!', coins: 40, emoji: '🔨' },
        { event: 'You host a treehouse party! Entry fees collected!', coins: 50, emoji: '🎉' },
        { event: 'You find a bird nest with shiny objects!', coins: 32, emoji: '🪺' }
    ],
    mine: [
        { event: 'You strike gold! Well, pyrite... but it\'s shiny!', coins: 45, emoji: '⛏️' },
        { event: 'You discover a vein of precious gems!', coins: 70, emoji: '💎' },
        { event: 'You help miners rescue a trapped panda!', coins: 55, emoji: '🦺' }
    ]
};

const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes
const cooldowns = new Map();

module.exports = {
    name: 'explore',
    description: 'Explore various locations across Panfu island!',

    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription('Explore various locations across Panfu island!')
        .addStringOption(opt =>
            opt.setName('location')
                .setDescription('Where do you want to explore?')
                .setRequired(true)
                .addChoices(
                    { name: '🏖️ Beach', value: 'beach' },
                    { name: '🌋 Volcano', value: 'volcano' },
                    { name: '🪩 Disco Dome', value: 'disco' },
                    { name: '🗼 Lighthouse', value: 'lighthouse' },
                    { name: '🏰 Castle', value: 'castle' },
                    { name: '🌴 Jungle', value: 'jungle' },
                    { name: '🥋 Dojo', value: 'dojo' },
                    { name: '🎋 Bamboo Forest', value: 'bamboo' },
                    { name: '🏡 Treehouse', value: 'treehouse' },
                    { name: '⛏️ Mine', value: 'mine' }
                )
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const location = interaction.options.getString('location');
        const locationData = LOCATIONS[location];

        // Check cooldown
        const now = Date.now();
        const cooldownEnd = cooldowns.get(userId);
        
        if (cooldownEnd && now < cooldownEnd) {
            const timeLeft = Math.ceil((cooldownEnd - now) / 1000 / 60);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('😴 Need to Rest')
                .setDescription(`You're too tired to explore! Rest for **${timeLeft} more minutes**.`)
                .setFooter({ text: 'Exploring takes energy!' })
                .setTimestamp();
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Set cooldown
        cooldowns.set(userId, now + COOLDOWN_TIME);

        // Determine encounter type (40% coins, 30% items, 30% NPCs)
        const encounterRoll = Math.random() * 100;
        let encounterType;
        let coinsEarned = 0;
        let encounterMessage = '';
        let encounterTitle = '';
        let embedColor = '#3498db';

        // 20% chance for special location event
        if (Math.random() < 0.2 && LOCATION_EVENTS[location]) {
            const events = LOCATION_EVENTS[location];
            const event = events[Math.floor(Math.random() * events.length)];
            
            coinsEarned = event.coins;
            encounterTitle = `${event.emoji} Special Event!`;
            encounterMessage = `${event.event}\n\n💰 **+${coinsEarned} coins**`;
            embedColor = '#f39c12';
        }
        // 30% NPC encounter
        else if (encounterRoll < 30) {
            const npc = NPCS[Math.floor(Math.random() * NPCS.length)];
            const gift = npc.gifts[Math.floor(Math.random() * npc.gifts.length)];
            coinsEarned = Math.floor(Math.random() * (npc.coins[1] - npc.coins[0] + 1)) + npc.coins[0];
            
            encounterTitle = `👋 You met ${npc.name}!`;
            encounterMessage = `**${npc.name}** - *${npc.role}*\n\n"${npc.greeting}"\n\n🎁 You received: **${gift}**\n💰 **+${coinsEarned} coins**`;
            embedColor = '#9b59b6';
        }
        // 40% item find
        else if (encounterRoll < 70) {
            const item = ENCOUNTERS.ITEM_FIND.items[Math.floor(Math.random() * ENCOUNTERS.ITEM_FIND.items.length)];
            coinsEarned = item.value;
            
            encounterTitle = `${item.emoji} Found an Item!`;
            encounterMessage = `You discovered a **${item.name}**!\n\nYou sell it for **${coinsEarned} coins**!`;
            embedColor = '#2ecc71';
        }
        // 30% coin find
        else {
            const messages = ENCOUNTERS.COIN_FIND.messages;
            const message = messages[Math.floor(Math.random() * messages.length)];
            const amounts = ENCOUNTERS.COIN_FIND.amounts;
            coinsEarned = amounts[Math.floor(Math.random() * amounts.length)];
            
            encounterTitle = '💰 Found Coins!';
            encounterMessage = `${message}\n\n💰 **+${coinsEarned} coins**`;
            embedColor = '#f1c40f';
        }

        // Update coins in database
        if (database && database.isInitialized()) {
            try {
                await database.updateUserCoins(userId, coinsEarned);
                const user = await database.getUserProfile(userId, username);

                // Track achievement progress
                const statsResult = await database.pool.query(
                    'SELECT stats FROM discord_users WHERE user_id = $1',
                    [userId]
                );

                const stats = statsResult.rows[0]?.stats || {};
                stats.explorations = (stats.explorations || 0) + 1;
                
                // Track unique locations visited
                if (!stats.locations_visited) {
                    stats.locations_visited = [];
                }
                if (!stats.locations_visited.includes(location)) {
                    stats.locations_visited.push(location);
                }

                // Update stats using merge function to avoid overwriting other fields like pet
                await database.updateUserStats(userId, {
                    explorations: stats.explorations,
                    locations_visited: stats.locations_visited
                });

                const embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setTitle(`${locationData.emoji} Exploring ${locationData.name}`)
                    .setDescription(`*${locationData.description}*\n\n${encounterMessage}`)
                    .addFields(
                        { name: '💵 New Balance', value: `${user.coins} coins`, inline: true },
                        { name: '⏰ Next Explore', value: 'Available in 5 minutes', inline: true }
                    )
                    .setFooter({ text: 'Keep exploring to meet more pandas and find treasures!' })
                    .setTimestamp();

                // Send main reply first
                await interaction.reply({ embeds: [embed] });

                // Then check and send achievement notifications as followUp
                try {
                    const { checkAndAwardAchievement } = require('./achievements');
                    
                    const achievements = [
                        { id: 'explore_1', progress: stats.explorations },
                        { id: 'explore_10', progress: stats.explorations },
                        { id: 'explore_50', progress: stats.explorations },
                        { id: 'explore_100', progress: stats.explorations },
                        { id: 'explore_all', progress: stats.locations_visited.length }
                    ];

                    for (const { id, progress } of achievements) {
                        const unlockedAchievement = await checkAndAwardAchievement(userId, username, id, progress);
                        if (unlockedAchievement) {
                            await interaction.followUp({
                                embeds: [new EmbedBuilder()
                                    .setColor('#f1c40f')
                                    .setTitle('🏆 Achievement Unlocked!')
                                    .setDescription(`**${unlockedAchievement.name}**\n${unlockedAchievement.description}`)
                                    .addFields(
                                        { name: 'Rewards', value: `+${unlockedAchievement.coins} coins, +${unlockedAchievement.xp} XP`, inline: false }
                                    )
                                    .setTimestamp()]
                            });
                        }
                    }
                } catch (achievementError) {
                    console.log('Achievement check failed:', achievementError.message);
                }

                return;
            } catch (error) {
                console.log('Database explore failed, using JSON fallback:', error.message);
            }
        }

        // JSON fallback
        const userData = loadUserData();
        if (!userData[userId]) {
            userData[userId] = {
                pandaName: username + "'s Panda",
                color: 'classic',
                accessories: [],
                coins: 100,
                level: 1,
                experience: 0,
                stats: {
                    friendship: 50,
                    energy: 100,
                    happiness: 75,
                    bamboo_eaten: 0,
                    games_played: 0,
                    days_active: 1
                },
                joinDate: new Date().toISOString()
            };
        }

        userData[userId].coins += coinsEarned;
        saveUserData(userData);

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`${locationData.emoji} Exploring ${locationData.name}`)
            .setDescription(`*${locationData.description}*\n\n${encounterMessage}`)
            .addFields(
                { name: '💵 New Balance', value: `${userData[userId].coins} coins`, inline: true },
                { name: '⏰ Next Explore', value: 'Available in 5 minutes', inline: true }
            )
            .setFooter({ text: 'Keep exploring to meet more pandas and find treasures!' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
