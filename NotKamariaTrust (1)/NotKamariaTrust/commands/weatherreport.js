const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Panfu locations and their weather possibilities
const locations = [
    {
        name: "Volcano",
        emoji: "🌋",
        weathers: [
            "Scorching hot with a chance of lava showers",
            "Ash clouds blocking out the sun - bring sunglasses anyway",
            "Molten rock precipitation expected around 3 PM",
            "Perfect weather for roasting marshmallows",
            "Earthquake tremors: 7/10 on the Richter scale of chaos",
            "Sulfur fog advisory - pandas may smell worse than usual"
        ]
    },
    {
        name: "Disco Dome", 
        emoji: "💃",
        weathers: [
            "Mirror ball reflections causing temporary blindness",
            "Bass drops so heavy they're affecting local gravity",
            "Fog machine malfunction - visibility near zero",
            "Glitter storm warning - everything will be fabulous",
            "Dance floor slippery due to spilled punch",
            "Strobe light intensity: epilepsy-inducing"
        ]
    },
    {
        name: "Swamp of Sadness",
        emoji: "🪱", 
        weathers: [
            "100% humidity with tears falling from the sky",
            "Mosquito swarms thick enough to walk on",
            "Existential dread fog rolling in from the east",
            "Mud consistency: perfect for wallowing",
            "Sad frog chorus reaching peak depression",
            "Murky water levels rising due to collective sobbing"
        ]
    },
    {
        name: "Lighthouse",
        emoji: "🔦",
        weathers: [
            "Lighthouse beam cutting through dramatic storm clouds",
            "Seagulls screaming louder than usual - migraine warning",
            "Salt spray making everything crunchy",
            "Perfect visibility for spotting shipwrecks",
            "Wind strong enough to blow pandas off cliffs",
            "Romantic sunset ruined by the smell of dead fish"
        ]
    },
    {
        name: "Castle", 
        emoji: "🏰",
        weathers: [
            "Royal rain falling only on peasants",
            "Kamaria's mood affecting atmospheric pressure",
            "Dungeon dampness seeping into the courtyard",
            "Majestic clouds shaped like judgmental expressions",
            "Crown jewel glare causing rainbow prisms",
            "Guards complaining about armor rust - high humidity"
        ]
    },
    {
        name: "Jungle",
        emoji: "🌴", 
        weathers: [
            "Banana shortage causing climate anxiety among monkeys",
            "Vine swing traffic jams during rush hour",
            "Tropical humidity making fur stick to everything",
            "Parrot gossip network operating at full capacity",
            "Coconut falling hazard: elevated",
            "Jungle drums drowning out weather reports"
        ]
    },
    {
        name: "Beach",
        emoji: "🏖️",
        weathers: [
            "Sand temperature: surface-of-the-sun hot",
            "Waves perfect for dramatic slow-motion running",
            "Seashell collection competition causing territorial disputes",
            "Sunscreen supplies critically low",
            "Beach volleyball net mysteriously tangled",
            "Jellyfish invasion - swimming not recommended"
        ]
    },
    {
        name: "Dojo",
        emoji: "🥋",
        weathers: [
            "Zen garden sand patterns disturbed by strong winds",
            "Meditation interrupted by nearby construction noise",
            "Bamboo creaking ominously in the breeze",
            "Spiritual energy levels: surprisingly low",
            "Training dummy revenge plot suspected",
            "Inner peace forecast: unlikely with current drama levels"
        ]
    }
];

// Weather personalities for different times
const weatherPersonalities = [
    "Your overly dramatic weather panda",
    "Kamaria's grumpy weather apprentice", 
    "The existentially confused meteorologist",
    "Bonez's questionably accurate weather source",
    "Eloise's stressed-out weather intern"
];

module.exports = {
    name: 'weatherreport',
    aliases: ['weather', 'forecast'],
    description: 'Get the latest dramatic weather report from across Panfu island',

    data: new SlashCommandBuilder()
        .setName('weatherreport')
        .setDescription('Get the latest dramatic weather report from across Panfu island')
        .addStringOption(opt =>
            opt.setName('location')
                .setDescription('Specific location to check (optional)')
                .addChoices(
                    { name: 'Volcano', value: 'volcano' },
                    { name: 'Disco Dome', value: 'disco dome' },
                    { name: 'Swamp of Sadness', value: 'swamp of sadness' },
                    { name: 'Lighthouse', value: 'lighthouse' },
                    { name: 'Castle', value: 'castle' },
                    { name: 'Jungle', value: 'jungle' },
                    { name: 'Beach', value: 'beach' },
                    { name: 'Dojo', value: 'dojo' }
                )
        ),

    async execute(message, args, client) {
        const specificLocation = args[0]?.toLowerCase();
        const reporter = weatherPersonalities[Math.floor(Math.random() * weatherPersonalities.length)];

        if (specificLocation) {
            const location = locations.find(loc => 
                loc.name.toLowerCase().includes(specificLocation)
            );

            if (!location) {
                return message.reply("🌤️ That location doesn't exist! Try: volcano, disco dome, swamp, lighthouse, castle, jungle, beach, or dojo.");
            }

            const weather = location.weathers[Math.floor(Math.random() * location.weathers.length)];
            const temperature = Math.floor(Math.random() * 40) + 60; // 60-100°F
            const chance = Math.floor(Math.random() * 100);

            const locationEmbed = new EmbedBuilder()
                .setTitle(`${location.emoji} ${location.name} Weather Report`)
                .setColor(0x3498db)
                .setDescription(
                    `**Current Conditions:** ${weather}\n\n` +
                    `**Temperature:** ${temperature}°F (${Math.round((temperature - 32) * 5/9)}°C)\n` +
                    `**Chance of Drama:** ${chance}%\n` +
                    `**Recommendation:** ${chance > 70 ? "Stay indoors and order pizza" : chance > 40 ? "Proceed with caution" : "Perfect day for questionable decisions"}\n\n` +
                    `*Reported by: ${reporter}*`
                )
                .setFooter({ text: "Weather reports may contain traces of sarcasm" });

            return message.reply({ embeds: [locationEmbed] });
        }

        // Full island weather report
        const weatherData = locations.map(location => {
            const weather = location.weathers[Math.floor(Math.random() * location.weathers.length)];
            const temp = Math.floor(Math.random() * 40) + 60;
            return `${location.emoji} **${location.name}:** ${weather} (${temp}°F)`;
        });

        const islandCondition = [
            "Chaos levels are higher than usual across the island",
            "General mood: existential crisis with scattered hope",
            "Drama forecast: inevitable with a chance of tea-spilling", 
            "Overall vibe: pandas being pandas",
            "Island-wide therapy session recommended",
            "Collective sanity levels: concerningly low"
        ][Math.floor(Math.random() * 6)];

        const fullEmbed = new EmbedBuilder()
            .setTitle("🌍 Panfu Island Weather Report")
            .setColor(0xe67e22)
            .setDescription(
                `**Island-Wide Conditions:** ${islandCondition}\n\n` +
                weatherData.join('\n\n')
            )
            .setFooter({ text: `Reported by: ${reporter} | Weather subject to sudden panda-induced changes` });

        return message.reply({ embeds: [fullEmbed] });
    }
};