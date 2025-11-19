const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadUserData, saveUserData } = require('../utils/storage');
const database = require('../utils/database');

// List of Panfu locations + fun clues
const clues = [
  {
    answer: "volcano",
    riddle: "🔥 I rumble and smoke, and the bravest pandas roast marshmallows near my edge."
  },
  {
    answer: "jungle",
    riddle: "🌴 My trees gossip with monkeys while you hunt for golden bananas."
  },
  {
    answer: "castle",
    riddle: "🏰 Stone walls hide Kamaria's secrets and your lack of fashion sense."
  },
  {
    answer: "dojo",
    riddle: "🥋 Silence, bamboo, and that faint smell of sweaty headbands."
  },
  {
    answer: "eerie forest",
    riddle: "🔭 Through the volcano's telescope I appear, where unicorns roam and hollow trees leer."
  },
  {
    answer: "disco dome",
    riddle: "💃 A glowing floor where only your shoes—and your dignity—light up."
  },
  {
    answer: "lighthouse",
    riddle: "🔦 I guide lost pandas at night, but mostly serve as a tall flex."
  },
  {
    answer: "beach",
    riddle: "🏖️ Sand between your paws and rumors in the air."
  },
  {
    answer: "farm",
    riddle: "🚜 Where pandas tend crops and animals moo their gossip all day long."
  },
  {
    answer: "swimming pool",
    riddle: "🏊 Dive deep for treasures while avoiding the lifeguard's whistle of judgment."
  },
  {
    answer: "sports field",
    riddle: "⚽ Where athletic pandas flex and others pretend they meant to miss that shot."
  },
  {
    answer: "ice cream parlor",
    riddle: "🍦 Sweet treats hide the secret entrance to knowledge and brain freeze."
  },
  {
    answer: "beauty salon",
    riddle: "💄 Where pandas get styled and gossip flows faster than hair dye."
  },
  {
    answer: "old harbor",
    riddle: "⚓ Salty air, creaking wood, and pirates who've seen better days."
  },
  {
    answer: "lake",
    riddle: "🏞️ Still waters reflect more than just your panda face—they judge your life choices."
  },
  {
    answer: "pony stables",
    riddle: "🐴 Where four-legged friends gallop and pandas learn what real speed looks like."
  },
  {
    answer: "library",
    riddle: "📚 Behind sweet treats lies wisdom, dust, and the smell of forgotten dreams."
  },
  {
    answer: "movie theater",
    riddle: "🎬 Red or blue rooms where pandas watch stories better than their own lives."
  },
  {
    answer: "pirate island",
    riddle: "🏴‍☠️ Yo ho ho and a bottle of regret—where treasure hunters become the hunted."
  },
  {
    answer: "waterfall cave",
    riddle: "💧 Behind rushing water lies a secret chamber where echoes mock your failures."
  },
  {
    answer: "city",
    riddle: "🏙️ The beating heart of Panfu, where all pandas converge to shop and judge."
  }
];

module.exports = {
    name: 'treasurehunt',
    aliases: ['hunt', 'treasure'],
    description: 'Start a Panfu treasure hunt for everyone in the channel!',

    data: new SlashCommandBuilder()
        .setName('treasurehunt')
        .setDescription('Start a Panfu treasure hunt for everyone in the channel!'),

    async execute(message, args, client) {
        // Pick a random clue
        const { answer, riddle } = clues[Math.floor(Math.random() * clues.length)];
        const reward = Math.floor(Math.random() * 10) + 5; // 5–15 coins

      await interaction.deferReply();
      
        const embed = new EmbedBuilder()
            .setTitle("🏴‍☠️ Panfu Treasure Hunt!")
            .setColor(0xf1c40f)
            .setDescription(
                `Solve this riddle to find the location of the treasure!\n\n` +
                `**Riddle:** ${riddle}\n\n` +
                `*Type the location name in chat (one word is enough).*`
            )
            .setFooter({ text: "First correct answer wins the coins!" });

        await message.reply({ content: "@everyone", embeds: [embed] });

        // Create a message collector for 60 seconds
        const filter = m => !m.author.bot;
        const collector = message.channel.createMessageCollector({ filter, time: 60_000 });

        collector.on('collect', async m => {
            if (m.content.toLowerCase().includes(answer.toLowerCase())) {
                collector.stop('found');

                const userId = m.author.id;
                let newBalance = 0;

                // Try database first
                if (database && database.isInitialized()) {
                    try {
                        await database.getUserProfile(userId, m.author.username);
                        await database.updateUserCoins(userId, reward);
                        const updatedUser = await database.getUserProfile(userId, m.author.username);
                        newBalance = updatedUser.coins;

                        message.channel.send(
                            `🎉 **${m.author.username}** found the treasure at **${answer}**!\n` +
                            `They earn **${reward} coins**. Balance: ${newBalance}`
                        );
                        return;
                    } catch (error) {
                        console.log('Database failed for treasure reward, using JSON fallback:', error.message);
                    }
                }

                // JSON fallback
                const userData = loadUserData();
                if (!userData[userId]) {
                    userData[userId] = {
                        panda: {
                            name: `${m.author.username}'s Panda`,
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

                userData[userId].coins += reward;
                saveUserData(userData);

                message.channel.send(
                    `🎉 **${m.author.username}** found the treasure at **${answer}**!\n` +
                    `They earn **${reward} coins**. Balance: ${userData[userId].coins}`
                );
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'found') {
                message.channel.send(`⏰ Time's up! No one solved the riddle. The treasure remains hidden at **${answer}**.`);
            }
        });
    }
};
