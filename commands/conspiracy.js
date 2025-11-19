const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

await interaction.deferReply();

// Wild conspiracy theories about Panfu lore
const conspiracies = [
    {
        title: "The Bamboo Illuminati",
        theory: "All bamboo on the island is actually controlled by a secret society of pandas. They artificially create shortages to maintain power over the economy.",
        evidence: ["Bamboo prices fluctuate suspiciously", "Certain pandas always have bamboo stockpiles", "The jungle has unexplained bamboo-free zones"],
        believability: 7
    },
    {
        title: "Bonez's Time Loop", 
        theory: "Bonez isn't actually scamming anyone - he's trapped in a time loop and trying to collect enough coins to break free from his eternal curse.",
        evidence: ["He always appears in the same locations", "His scams never actually evolve", "Time moves differently around him"],
        believability: 8
    },
    {
        title: "Kamaria's Simulation Theory",
        theory: "The entire island is actually a simulation run by Kamaria to test panda behavior. We're all just NPCs in her cosmic experiment.",
        evidence: ["Her prophecies are too accurate", "Physics work differently around the castle", "Some pandas randomly disappear"],
        believability: 9
    },
    {
        title: "The Disco Dome Mind Control",
        theory: "The disco ball emits hypnotic frequencies that make pandas docile and compliant. The dancing is actually a form of mass hypnosis.",
        evidence: ["Pandas act differently after visiting", "The music has subliminal messages", "Nobody questions why they keep going back"],
        believability: 6
    },
    {
        title: "Eloise's Secret Origin",
        theory: "Eloise isn't originally from Panfu. She's an interdimensional being who took over the body of a regular panda to study our society through fashion.",
        evidence: ["Her fashion knowledge is too perfect", "She never ages", "Her eyes glow sometimes"],
        believability: 8
    },
    {
        title: "The Lighthouse Alien Signal",
        theory: "The lighthouse isn't guiding ships - it's actually sending signals to an alien mothership orbiting the planet.",
        evidence: ["Strange lights in the sky", "The lighthouse keeper speaks in code", "Missing pandas near the lighthouse"],
        believability: 5
    },
    {
        title: "Swamp of Sadness Dimensional Portal",
        theory: "The swamp is actually a portal to the dimension of infinite sadness. That's why pandas get stuck - they're being pulled into another reality.",
        evidence: ["Time moves slower in the swamp", "Sounds echo strangely", "Some pandas come back... different"],
        believability: 7
    },
    {
        title: "The Volcano Energy Harvesting", 
        theory: "The volcano doesn't just produce lava - it's harvesting the life energy of pandas to power an ancient machine beneath the island.",
        evidence: ["Pandas feel drained after visiting", "Strange humming sounds from underground", "The lava glows with an unnatural light"],
        believability: 6
    },
    {
        title: "Dojo Martial Arts Government",
        theory: "The dojo is actually the secret government of the island. All major decisions are made by the karate masters in underground councils.",
        evidence: ["Important events happen after dojo meetings", "High-ranking pandas all have karate training", "Secret tunnels beneath the dojo"],
        believability: 7
    },
    {
        title: "Beach Weather Manipulation",
        theory: "Someone is artificially controlling the weather at the beach to maximize tourism revenue. Perfect weather doesn't just happen naturally.",
        evidence: ["Weather is always convenient", "Strange clouds that appear and disappear", "Hidden weather machines in the rocks"],
        believability: 4
    },
    {
        title: "The Great Panda Replacement",
        theory: "Original pandas are being slowly replaced by identical copies. Real pandas are being held captive in an underground facility.",
        evidence: ["Some pandas act out of character", "Slight differences in behavior patterns", "Memory gaps about early island history"],
        believability: 9
    },
    {
        title: "Jungle Sentient Plant Network",
        theory: "All plants in the jungle are connected through underground root networks and are actually one massive sentient organism plotting against pandas.",
        evidence: ["Plants seem to watch you", "Fruit appears and disappears mysteriously", "Strange whispers in the wind"],
        believability: 5
    }
];

// Conspiracy investigator personalities
const investigators = [
    "Anonymous Paranoid Panda",
    "The Truth Seeker",
    "Deep Throat (Panda Edition)",
    "Whistleblower in the Shadows",
    "Ex-Government Insider",
    "Rogue Scientist",
    "Underground Journalist"
];

module.exports = {
    name: 'conspiracy',
    aliases: ['theory', 'truth', 'illuminati'],
    description: 'Uncover wild conspiracy theories about Panfu island',

    data: new SlashCommandBuilder()
        .setName('conspiracy')
        .setDescription('Uncover wild conspiracy theories about Panfu island'),

    async execute(message, args, client) {
        const theory = conspiracies[Math.floor(Math.random() * conspiracies.length)];
        const investigator = investigators[Math.floor(Math.random() * investigators.length)];

        const beliefMeter = "█".repeat(theory.believability) + "░".repeat(10 - theory.believability);

        const conspiracyEmbed = new EmbedBuilder()
            .setTitle(`🕵️ CLASSIFIED: ${theory.title}`)
            .setColor(0x2c3e50)
            .setDescription(
                `**THE THEORY:**\n${theory.theory}\n\n` +
                `**EVIDENCE:**\n${theory.evidence.map(e => `• ${e}`).join('\n')}\n\n` +
                `**BELIEVABILITY METER:**\n\`${beliefMeter}\` ${theory.believability}/10\n\n` +
                `*Information provided by: ${investigator}*\n` +
                `*Remember: Trust no one, question everything*`
            )
            .setFooter({ text: "This message will self-destruct in 5... 4... 3... just kidding" });

        return message.reply({ embeds: [conspiracyEmbed] });
    }
};
