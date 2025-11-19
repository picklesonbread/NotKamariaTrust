const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

await interaction.deferReply();

const PANFU_QUESTIONS = [
    // HISTORY QUESTIONS
    {
        question: "When was Panfu officially launched to the public?",
        options: ["November 1, 2007", "December 1, 2007", "January 1, 2008", "October 10, 2007"],
        correct: 1,
        difficulty: "medium",
        category: "history"
    },
    {
        question: "When did Panfu permanently close?",
        options: ["December 2015", "November 2016", "January 2017", "October 2016"],
        correct: 1,
        difficulty: "medium",
        category: "history"
    },
    {
        question: "How many total users did Panfu reach at its peak in 2010?",
        options: ["5 million", "10 million", "15 million", "20 million"],
        correct: 2,
        difficulty: "hard",
        category: "history"
    },
    {
        question: "When was the Castle location added to Panfu?",
        options: ["November 2007", "December 2007", "January 2008", "February 2008"],
        correct: 1,
        difficulty: "hard",
        category: "history"
    },
    {
        question: "What was Panfu inspired by?",
        options: ["Neopets", "Club Penguin", "Habbo Hotel", "Webkinz"],
        correct: 1,
        difficulty: "easy",
        category: "history"
    },
    {
        question: "When was beta testing for Panfu started?",
        options: ["September 2007", "November 2007", "December 2007", "January 2008"],
        correct: 1,
        difficulty: "hard",
        category: "history"
    },
    {
        question: "How many users did Panfu have just 6 weeks after launch?",
        options: ["100,000", "300,000", "500,000", "1 million"],
        correct: 1,
        difficulty: "hard",
        category: "history"
    },
    {
        question: "When did Panfu hit 1 million registered users?",
        options: ["January 2008", "April 2008", "July 2008", "December 2008"],
        correct: 1,
        difficulty: "medium",
        category: "history"
    },
    {
        question: "When were Panda Sheriffs introduced?",
        options: ["March 2009", "July 2009", "November 2009", "January 2010"],
        correct: 1,
        difficulty: "medium",
        category: "history"
    },
    {
        question: "What was the original codename for Panfu during development?",
        options: ["Pandaland", "Panda World", "Panfu Island", "Bamboo Kingdom"],
        correct: 0,
        difficulty: "hard",
        category: "history"
    },
    {
        question: "When did Panfu's chat system get disabled due to low activity?",
        options: ["2011", "2012", "2013", "2014"],
        correct: 2,
        difficulty: "medium",
        category: "history"
    },
    {
        question: "What was the name of the company that created Panfu?",
        options: ["Young Internet GmbH", "Goodbeans", "Panda Studios", "Virtual Worlds Inc"],
        correct: 0,
        difficulty: "medium",
        category: "history"
    },

    // CHARACTER QUESTIONS
    {
        question: "What are the names of Panfu's main reporter mascots?",
        options: ["Bruno and Kamaria", "Max and Ella", "Troy and Eloise", "Gonzo and Farid"],
        correct: 1,
        difficulty: "easy",
        category: "characters"
    },
    {
        question: "How old is Kamaria, the mystical witch?",
        options: ["100 years old", "228 years old", "500 years old", "50 years old"],
        correct: 1,
        difficulty: "hard",
        category: "characters"
    },
    {
        question: "What is the name of the pirate character in Panfu?",
        options: ["Captain Hook", "William Pandabeard", "Pirate Pete", "Blackbeard Panda"],
        correct: 1,
        difficulty: "medium",
        category: "characters"
    },
    {
        question: "Which character was the reformed villain who became an innocent child?",
        options: ["Bonez", "Krucio/Paul the Kid", "Carl Caruso", "Evron"],
        correct: 1,
        difficulty: "hard",
        category: "characters"
    },
    {
        question: "What was the name of Panfu's band?",
        options: ["The Bamboo Band", "The Smashing Pancakes", "Panda Rockers", "The Disco Pandas"],
        correct: 1,
        difficulty: "medium",
        category: "characters"
    },
    {
        question: "Who is the sailor/fisherman with a white beard at Old Harbour?",
        options: ["Captain Jack", "Horst Hering", "William Pandabeard", "Bruno"],
        correct: 1,
        difficulty: "hard",
        category: "characters"
    },
    {
        question: "Which character is known as the money-obsessed schemer?",
        options: ["Gonzo", "Bonez", "Krucio", "Carl Caruso"],
        correct: 1,
        difficulty: "medium",
        category: "characters"
    },
    {
        question: "Who was the main antagonist and evil ruler of Bitterland?",
        options: ["Bonez", "Evron", "Paul the Kid", "Carl Caruso"],
        correct: 1,
        difficulty: "medium",
        category: "characters"
    },
    {
        question: "Which character was obsessed with pancakes?",
        options: ["Max", "Troy", "Paul the Kid", "Gonzo"],
        correct: 2,
        difficulty: "medium",
        category: "characters"
    },
    {
        question: "Who is the pet expert that helps save Pokopets?",
        options: ["Ella", "Eloise", "Kamaria", "Lili Panphung"],
        correct: 1,
        difficulty: "medium",
        category: "characters"
    },
    {
        question: "Who is the vampire character in Panfu?",
        options: ["Freddy the Vampire", "Count Dracula", "Bonez", "Carl Caruso"],
        correct: 0,
        difficulty: "medium",
        category: "characters"
    },
    {
        question: "Who is the artist found at Castle Ballroom?",
        options: ["Pandalangelo", "Picasso Panda", "Leonardo", "Hamelot"],
        correct: 0,
        difficulty: "hard",
        category: "characters"
    },
    {
        question: "Who is the pool attendant/lifeguard?",
        options: ["Bruno", "Willi", "Troy", "Farid"],
        correct: 1,
        difficulty: "medium",
        category: "characters"
    },
    {
        question: "Who is The Chronicler that documents Panfu's history?",
        options: ["Professor Bookworm", "Hamelot", "Max", "William Pandabeard"],
        correct: 1,
        difficulty: "hard",
        category: "characters"
    },
    {
        question: "Who is the scientist found in Jungle Cave?",
        options: ["Dr. Feelgood", "Professor Bookworm", "Carl Caruso", "Coach Sporty"],
        correct: 1,
        difficulty: "medium",
        category: "characters"
    },

    // LOCATION QUESTIONS
    {
        question: "What were the original 5 locations in Panfu's beta version?",
        options: ["Beach, Castle, Disco, Volcano, Jungle", "City, Swimming Pool, Sports Field, Volcano, Jungle", "Dojo, Mine, Beach, Castle, Lighthouse", "Town, Harbor, Beach, Volcano, Forest"],
        correct: 1,
        difficulty: "hard",
        category: "locations"
    },
    {
        question: "Which location housed Kamaria's tower?",
        options: ["Lighthouse", "Castle", "Treehouse", "Volcano"],
        correct: 1,
        difficulty: "easy",
        category: "locations"
    },
    {
        question: "Which location was members-only and accessed from the Swimming Pool?",
        options: ["Underwater School", "Secret Cave", "Deep Ocean", "Coral Reef"],
        correct: 0,
        difficulty: "medium",
        category: "locations"
    },
    {
        question: "Where can you find the Pirate Bar?",
        options: ["Beach", "Old Harbor", "Castle", "Jungle"],
        correct: 1,
        difficulty: "easy",
        category: "locations"
    },
    {
        question: "Which location is your personal customizable room?",
        options: ["Castle", "Treehouse", "Bedroom", "Den"],
        correct: 1,
        difficulty: "easy",
        category: "locations"
    },
    {
        question: "Where can you find the Ice Cream Parlour with a library inside?",
        options: ["City", "San FranPanfu", "Beach", "Castle"],
        correct: 0,
        difficulty: "medium",
        category: "locations"
    },
    {
        question: "What is the name of the evil region ruled by Evron?",
        options: ["Shadowland", "Bitterland", "Dark Forest", "Wasteland"],
        correct: 1,
        difficulty: "medium",
        category: "locations"
    },
    {
        question: "Where can you find the Beauty Salon in Panfu?",
        options: ["City", "San FranPanfu", "Beach", "Castle"],
        correct: 1,
        difficulty: "medium",
        category: "locations"
    },
    {
        question: "Where is the Pony Yard located?",
        options: ["Beach", "Jungle", "Sports Field area", "Castle"],
        correct: 2,
        difficulty: "hard",
        category: "locations"
    },
    {
        question: "Which location has a telescope to view the secret forest?",
        options: ["Lighthouse", "Volcano", "Castle", "Treehouse"],
        correct: 1,
        difficulty: "hard",
        category: "locations"
    },

    // GAMEPLAY QUESTIONS
    {
        question: "What was the name of Panfu's membership tier?",
        options: ["Premium Panda", "Gold Panda", "Diamond Panda", "VIP Panda"],
        correct: 1,
        difficulty: "easy",
        category: "gameplay"
    },
    {
        question: "What were Panfu's pets called?",
        options: ["Pandapets", "Pokopets", "Panfupets", "Bamboo Buddies"],
        correct: 1,
        difficulty: "medium",
        category: "gameplay"
    },
    {
        question: "What was the name of the quiz minigame in San Franpanfu?",
        options: ["Brain Blast", "Be Smarter", "Quiz Master", "Think Fast"],
        correct: 1,
        difficulty: "medium",
        category: "gameplay"
    },
    {
        question: "How many coins did you earn for getting 5/5 correct in Be Smarter?",
        options: ["250 coins", "500 coins", "1000 coins", "100 coins"],
        correct: 1,
        difficulty: "hard",
        category: "gameplay"
    },
    {
        question: "What does the name 'Panfu' combine?",
        options: ["Panda + Fun", "Panda + Chinese word for happiness", "Panda + Friends", "Panda + Future"],
        correct: 1,
        difficulty: "medium",
        category: "gameplay"
    },
    {
        question: "When were Pokopets (virtual pets) introduced to Panfu?",
        options: ["2008", "2009", "2010", "2011"],
        correct: 2,
        difficulty: "medium",
        category: "gameplay"
    },
    {
        question: "What was the name of the balloon-popping minigame at Old Harbor?",
        options: ["Balloon Blast", "Pop It", "Bubble Pop", "Sky Popper"],
        correct: 1,
        difficulty: "medium",
        category: "gameplay"
    },
    {
        question: "What was the fishing minigame called?",
        options: ["Gone Fishin'", "Fish'n'Fish", "Catch of the Day", "Deep Sea Fishing"],
        correct: 1,
        difficulty: "medium",
        category: "gameplay"
    },
    {
        question: "What role allowed players to enforce community standards?",
        options: ["Admin", "Panda Sheriff", "Moderator", "Guardian"],
        correct: 1,
        difficulty: "easy",
        category: "gameplay"
    },
    {
        question: "What was the monthly free trial day called for Gold Panda features?",
        options: ["Free Friday", "Gold Panda Day", "Premium Day", "Treasure Tuesday"],
        correct: 1,
        difficulty: "medium",
        category: "gameplay"
    },
    {
        question: "Which quest rewarded you with the first Pokopet named Woody?",
        options: ["Find Woody", "Save the Pokopets!", "Pet Rescue", "Eloise's Mission"],
        correct: 1,
        difficulty: "hard",
        category: "gameplay"
    },
    {
        question: "What was the hardest quest difficulty in Panfu?",
        options: ["Amalura's Love Story", "Spies in Bitterland", "The Chronicler", "Big Foot"],
        correct: 0,
        difficulty: "hard",
        category: "gameplay"
    },
    {
        question: "How many languages was Panfu available in at its peak?",
        options: ["6", "8", "10", "12"],
        correct: 3,
        difficulty: "hard",
        category: "gameplay"
    },
    {
        question: "What technology was Panfu originally built with?",
        options: ["HTML5", "Flash", "Unity", "Java"],
        correct: 1,
        difficulty: "medium",
        category: "gameplay"
    },
    {
        question: "How much did a diving suit cost to access Underwater School?",
        options: ["500 coins", "1,000 coins", "2,000 coins", "5,000 coins"],
        correct: 1,
        difficulty: "hard",
        category: "gameplay"
    }
];

const GENERAL_QUESTIONS = [
    {
        question: "What is a panda's favorite food?",
        options: ["Fish", "Bamboo", "Berries", "Honey"],
        correct: 1,
        difficulty: "easy",
        category: "nature"
    },
    {
        question: "What country are pandas native to?",
        options: ["Japan", "China", "Korea", "Thailand"],
        correct: 1,
        difficulty: "easy",
        category: "geography"
    },
    {
        question: "How many hours a day does a panda typically eat bamboo?",
        options: ["5-7 hours", "8-10 hours", "12-14 hours", "16-18 hours"],
        correct: 2,
        difficulty: "medium",
        category: "nature"
    },
    {
        question: "What color are baby pandas when they're born?",
        options: ["Black and white", "Pink", "Gray", "Brown"],
        correct: 1,
        difficulty: "medium",
        category: "nature"
    },
    {
        question: "According to Panfu lore, what's the best dance move at the Disco Dome?",
        options: ["The Bamboo Shuffle", "The Moonwalk", "The Robot", "The Worm"],
        correct: 0,
        difficulty: "easy",
        category: "fun"
    },
    {
        question: "If you were exploring a volcano, what would you NOT want to step in?",
        options: ["Lava", "Water", "Snow", "Grass"],
        correct: 0,
        difficulty: "easy",
        category: "science"
    },
    {
        question: "What do pandas in Panfu use to buy items?",
        options: ["Bamboo Bucks", "Coins", "Gems", "Stars"],
        correct: 1,
        difficulty: "easy",
        category: "gameplay"
    },
    {
        question: "How many giant pandas are estimated to be left in the wild?",
        options: ["500-1000", "1,864", "5,000", "10,000"],
        correct: 1,
        difficulty: "hard",
        category: "nature"
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: 3,
        difficulty: "easy",
        category: "geography"
    },
    {
        question: "What's the name of Earth's natural satellite?",
        options: ["Mars", "The Moon", "Venus", "Sun"],
        correct: 1,
        difficulty: "easy",
        category: "science"
    },
    {
        question: "How many continents are there on Earth?",
        options: ["5", "6", "7", "8"],
        correct: 2,
        difficulty: "easy",
        category: "geography"
    },
    {
        question: "What technology was Panfu built with?",
        options: ["HTML5", "Flash", "Unity", "JavaScript"],
        correct: 1,
        difficulty: "medium",
        category: "technology"
    },
    {
        question: "Which of these is a real minigame from Panfu?",
        options: ["Candy Crush", "Pop It", "Angry Birds", "Flappy Bird"],
        correct: 1,
        difficulty: "medium",
        category: "gameplay"
    },
    {
        question: "What year did the first iPhone release?",
        options: ["2005", "2007", "2009", "2010"],
        correct: 1,
        difficulty: "medium",
        category: "technology"
    },
    {
        question: "How many legs does a spider have?",
        options: ["6", "8", "10", "12"],
        correct: 1,
        difficulty: "easy",
        category: "nature"
    }
];

const ALL_QUESTIONS = [...PANFU_QUESTIONS, ...GENERAL_QUESTIONS];

const COIN_REWARDS = {
    easy: 10,
    medium: 20,
    hard: 30
};

const STREAK_BONUSES = {
    3: 15,
    5: 30,
    7: 50,
    10: 100,
    15: 200
};

const COOLDOWN_TIME = 2 * 60 * 1000; // 2 minutes
const cooldowns = new Map();

module.exports = {
    name: 'trivia',
    description: 'Test your Panfu knowledge and general trivia!',

    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Test your Panfu knowledge and general trivia!')
        .addStringOption(opt =>
            opt.setName('category')
                .setDescription('Choose a category (optional)')
                .addChoices(
                    { name: '🐼 All Questions', value: 'all' },
                    { name: '📚 Panfu History', value: 'history' },
                    { name: '👥 Panfu Characters', value: 'characters' },
                    { name: '🗺️ Panfu Locations', value: 'locations' },
                    { name: '🎮 Panfu Gameplay', value: 'gameplay' },
                    { name: '🌍 General Knowledge', value: 'general' }
                )
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const category = interaction.options.getString('category') || 'all';

        // Check cooldown
        const now = Date.now();
        const cooldownEnd = cooldowns.get(userId);
        
        if (cooldownEnd && now < cooldownEnd) {
            const timeLeft = Math.ceil((cooldownEnd - now) / 1000);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('🧠 Brain Needs Rest')
                .setDescription(`Think about your last answer! Wait **${timeLeft} seconds** before the next question.`)
                .setTimestamp();
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Filter questions by category
        let questionPool = ALL_QUESTIONS;
        
        if (category === 'general') {
            questionPool = GENERAL_QUESTIONS;
        } else if (category !== 'all') {
            questionPool = PANFU_QUESTIONS.filter(q => q.category === category);
            
            if (questionPool.length === 0) {
                questionPool = PANFU_QUESTIONS;
            }
        }

        // Pick random question
        const question = questionPool[Math.floor(Math.random() * questionPool.length)];
        
        // Get difficulty color
        const difficultyColors = {
            easy: '#2ecc71',
            medium: '#f39c12',
            hard: '#e74c3c'
        };
        
        const difficultyEmojis = {
            easy: '⭐',
            medium: '⭐⭐',
            hard: '⭐⭐⭐'
        };

        // Create buttons for options
        const buttons = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`trivia_0_${userId}`)
                    .setLabel(`1. ${question.options[0]}`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`trivia_1_${userId}`)
                    .setLabel(`2. ${question.options[1]}`)
                    .setStyle(ButtonStyle.Primary)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`trivia_2_${userId}`)
                    .setLabel(`3. ${question.options[2]}`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`trivia_3_${userId}`)
                    .setLabel(`4. ${question.options[3]}`)
                    .setStyle(ButtonStyle.Primary)
            )
        ];

        // Create embed
        const embed = new EmbedBuilder()
            .setColor(difficultyColors[question.difficulty])
            .setTitle('🧠 Panfu Trivia Challenge!')
            .setDescription(question.question)
            .addFields(
                { name: '🎯 Difficulty', value: `${difficultyEmojis[question.difficulty]} ${question.difficulty.toUpperCase()}`, inline: true },
                { name: '💰 Reward', value: `${COIN_REWARDS[question.difficulty]} coins`, inline: true }
            )
            .setFooter({ text: 'Click a button within 30 seconds!' })
            .setTimestamp();

        const response = await interaction.reply({ embeds: [embed], components: buttons, fetchReply: true });

        // Wait for button click
        const filter = i => i.user.id === userId && i.customId.startsWith('trivia_');
        
        try {
            const collected = await response.awaitMessageComponent({ 
                filter, 
                time: 30000 
            });

            const answer = parseInt(collected.customId.split('_')[1]);
            const isCorrect = answer === question.correct;

            // Disable all buttons
            buttons.forEach(row => {
                row.components.forEach(button => button.setDisabled(true));
            });
            await collected.update({ components: buttons });

            // Set cooldown
            cooldowns.set(userId, now + COOLDOWN_TIME);

            let coinsEarned = 0;
            let streakBonus = 0;
            let currentStreak = 0;

            // Update coins in database
            if (database && database.isInitialized()) {
                try {
                    // Get current streak from database
                    const statsResult = await database.pool.query(
                        'SELECT stats FROM discord_users WHERE user_id = $1',
                        [userId]
                    );

                    const stats = statsResult.rows[0]?.stats || {};
                    currentStreak = stats.trivia_streak || 0;

                    if (isCorrect) {
                        currentStreak++;
                        coinsEarned = COIN_REWARDS[question.difficulty];

                        // Check for streak bonuses
                        if (STREAK_BONUSES[currentStreak]) {
                            streakBonus = STREAK_BONUSES[currentStreak];
                            coinsEarned += streakBonus;
                        }

                        // Update stats: increment trivia_correct and update streak
                        stats.trivia_correct = (stats.trivia_correct || 0) + 1;
                        stats.trivia_streak = currentStreak;

                        await database.updateUserCoins(userId, coinsEarned);
                    } else {
                        // Reset streak on wrong answer
                        currentStreak = 0;
                        stats.trivia_streak = 0;
                    }

                    // Save updated stats to database using merge function to avoid overwriting other fields like pet
                    await database.updateUserStats(userId, {
                        trivia_correct: stats.trivia_correct,
                        trivia_streak: stats.trivia_streak
                    });
                    const user = await database.getUserProfile(userId, username);

                    const resultEmbed = new EmbedBuilder()
                        .setColor(isCorrect ? '#2ecc71' : '#e74c3c')
                        .setTitle(isCorrect ? '✅ Correct!' : '❌ Wrong!')
                        .setDescription(
                            isCorrect 
                                ? `Great job! You earned **${COIN_REWARDS[question.difficulty]} coins**!${streakBonus > 0 ? `\n\n🔥 **STREAK BONUS: +${streakBonus} coins!**` : ''}`
                                : `The correct answer was: **${question.options[question.correct]}**`
                        )
                        .addFields(
                            { name: '🔥 Current Streak', value: `${currentStreak} correct answer${currentStreak !== 1 ? 's' : ''}`, inline: true },
                            { name: '💵 Balance', value: `${user.coins} coins`, inline: true }
                        )
                        .setFooter({ text: currentStreak >= 3 ? `Keep it up! Next bonus at ${Object.keys(STREAK_BONUSES).find(k => k > currentStreak) || 'MAX'} streak!` : 'Get 3 in a row for a bonus!' })
                        .setTimestamp();

                    // Add next streak info
                    if (isCorrect && currentStreak > 0) {
                        const nextMilestone = Object.keys(STREAK_BONUSES).map(Number).find(k => k > currentStreak);
                        if (nextMilestone) {
                            resultEmbed.addFields({ 
                                name: '🎁 Next Streak Bonus', 
                                value: `${nextMilestone - currentStreak} more for +${STREAK_BONUSES[nextMilestone]} coins!`, 
                                inline: false 
                            });
                        }
                    }

                    await interaction.followUp({ embeds: [resultEmbed] });

                    // Then check and send achievement notifications
                    if (isCorrect) {
                        try {
                            const { checkAndAwardAchievement } = require('./achievements');
                            
                            const statsResult = await database.pool.query(
                                'SELECT stats FROM discord_users WHERE user_id = $1',
                                [userId]
                            );
                            const currentStats = statsResult.rows[0]?.stats || {};
                            
                            const achievements = [
                                { id: 'trivia_1', progress: currentStats.trivia_correct || 0 },
                                { id: 'trivia_10', progress: currentStats.trivia_correct || 0 },
                                { id: 'trivia_50', progress: currentStats.trivia_correct || 0 },
                                { id: 'trivia_100', progress: currentStats.trivia_correct || 0 },
                                { id: 'trivia_streak_10', progress: currentStreak }
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
                    }

                    return;
                } catch (error) {
                    console.log('Database trivia failed, using JSON fallback:', error.message);
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

            if (isCorrect) {
                userData[userId].coins += coinsEarned;
            }
            saveUserData(userData);

            const resultEmbed = new EmbedBuilder()
                .setColor(isCorrect ? '#2ecc71' : '#e74c3c')
                .setTitle(isCorrect ? '✅ Correct!' : '❌ Wrong!')
                .setDescription(
                    isCorrect 
                        ? `Great job! You earned **${COIN_REWARDS[question.difficulty]} coins**!${streakBonus > 0 ? `\n\n🔥 **STREAK BONUS: +${streakBonus} coins!**` : ''}`
                        : `The correct answer was: **${question.options[question.correct]}**`
                )
                .addFields(
                    { name: '🔥 Current Streak', value: `${currentStreak} correct answer${currentStreak !== 1 ? 's' : ''}`, inline: true },
                    { name: '💵 Balance', value: `${userData[userId].coins} coins`, inline: true }
                )
                .setFooter({ text: currentStreak >= 3 ? `Keep it up! Next bonus at ${Object.keys(STREAK_BONUSES).find(k => k > currentStreak) || 'MAX'} streak!` : 'Get 3 in a row for a bonus!' })
                .setTimestamp();

            return interaction.followUp({ embeds: [resultEmbed] });

        } catch (error) {
            // Timeout - disable all buttons
            buttons.forEach(row => {
                row.components.forEach(button => button.setDisabled(true));
            });
            
            const timeoutEmbed = new EmbedBuilder()
                .setColor('#95a5a6')
                .setTitle('⏰ Time\'s Up!')
                .setDescription(`The correct answer was: **${question.options[question.correct]}**\n\nBetter luck next time!`)
                .setTimestamp();

            // Reset streak in database on timeout
            if (database && database.isInitialized()) {
                try {
                    const statsResult = await database.pool.query(
                        'SELECT stats FROM discord_users WHERE user_id = $1',
                        [userId]
                    );
                    // Reset streak using merge function to avoid overwriting other fields like pet
                    await database.updateUserStats(userId, {
                        trivia_streak: 0
                    });
                } catch (dbError) {
                    console.log('Failed to reset streak on timeout:', dbError.message);
                }
            }
            
            await interaction.editReply({ embeds: [embed, timeoutEmbed], components: buttons });
        }
    }
};
