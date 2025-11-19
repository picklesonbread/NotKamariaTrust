const { Client, GatewayIntentBits, Events, Collection, ActivityType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { loadUserData, saveUserData } = require('./utils/storage');
const { deployCommands } = require('./deploy-commands');

// Import database utilities
const database = require('./utils/database');
let usingDatabase = false;


// Array of ridiculous prophecies
const prophecies = [
  "i looked into my crystal ball… you will stub your toe on a Lego tonight.",
  "darkness surrounds you… but mostly because you forgot to pay your electricity bill.",
  "a cursed panda will steal your bamboo stash at dawn.",
  "ur destiny is to get roasted by a 12-year-old in Roblox chat.",
  "Kamaria sees all… especially your cringe search history.",
  "beware! u will lag out of Panfu during the most important quest.",
  "the swamp whispers… and it said you smell.",
  "u will spend 3 hours fishing in Panfu and only catch one shoe.",
  "soon, your internet will disconnect right before a boss fight.",
  "a stranger in the server is secretly plotting to steal your pizza rolls.",
  "u will forget your password and cry in the shower.",
  "Kamaria reveals you will accidentally like your crush's 2014 Instagram post.",
  "doom approaches… and it's shaped like a Microsoft Clippy.",
  "one day, you will meet your soulmate… in a laggy Club Penguin dance party.",
  "the spirits show me… you failing basic math in front of everyone.",
  "a cursed minigame will eat your soul and spit out lag.",
  "the swamp demands sacrifice… preferably your WiFi router.",
  "ur destiny is to become the background character in someone else's story.",
  "i see… you dropping your phone on your face while doomscrolling.",
  "beware: your next meal will betray you with food poisoning.",
  "the pandas have voted. you are the weakest link. goodbye.",
  "u will spend 10 years grinding, only to realize the reward is a sticker.",
  "Kamaria has spoken: you peaked in your tutorial mission.",
  "soon, a pigeon will steal your fries while you watch helplessly.",
  "the swamp shows me… you, sitting in Discord VC, muted, eating chips loudly."
];

// Array of welcome messages 
const welcomeMessages = [
  "welcome to the server. Kamaria is totally **not** watching you through your webcam rn 👁👁.",
  "you’ve just joined Panfu’s witness protection program. don’t blow your cover.",
  "welcome, traveler. please deposit your golden bamboo into the guild bank immediately.",
  "another brave soul enters… little do they know this is just a discord clone of Club Penguin lore.",
  "new arrival detected. don’t feed them till midnight.",
  "welcome to 𓆩♡𓆪 𝚒𝚌𝚎 𝚌𝚛𝚎𝚊𝚖 𝚙𝚊𝚛𝚕𝚘𝚛 𐔌՞. .՞𐦯. please wipe your paws on the way in.",
  "u have unlocked the secret Kamaria ending. (there is no secret Kamaria ending.)",
  "a new user has arrived. odds of survival: 13%.",
  "you’ve been added to the Kamaria surveillance logs. smile :)",
  `breaking news: a wild {member} has spawned in Kamaria's den.`,
  "congrats, you’ve unlocked early access to Panfu 2.0 Beta. it’s worse.",
  "another one logs in… and another one bites the dust.",
  "welcome to 𓆩♡𓆪 𝚒𝚌𝚎 𝚌𝚛𝚎𝚊𝚖 𝚙𝚊𝚛𝚕𝚘𝚛 𐔌՞. .՞𐦯. mandatory clown shoes will be issued shortly.",
  "please don’t ask where Max is. we don’t talk about him.",
  "welcome! this is not a cult. definitely not. (ignore the chanting.)",
  "you’ve joined 𓆩♡𓆪 𝚒𝚌𝚎 𝚌𝚛𝚎𝚊𝚖 𝚙𝚊𝚛𝚕𝚘𝚛 𐔌՞. .՞𐦯! the exit door has been permanently sealed.",
  "Kamaria saw you join. she nodded in approval. that’s rare.",
  "achievement unlocked: joined 𓆩♡𓆪 𝚒𝚌𝚎 𝚌𝚛𝚎𝚊𝚖 𝚙𝚊𝚛𝚕𝚘𝚛 𐔌՞. .՞𐦯. reward: nothing.",
  "welcome to 𓆩♡𓆪 𝚒𝚌𝚎 𝚌𝚛𝚎𝚊𝚖 𝚙𝚊𝚛𝚕𝚘𝚛 𐔌՞. .՞𐦯. please sacrifice two goldfish to continue.",
  `a mysterious panda appears… oh wait, it’s just {member}.`,
  "welcome! please disable your firewall so Kamaria can see you better.",
  "u have been drafted into the Great Bamboo War. good luck.",
  "new member detected. prepare the interrogation room.",
  "welcome to 𓆩♡𓆪 𝚒𝚌𝚎 𝚌𝚛𝚎𝚊𝚖 𝚙𝚊𝚛𝚕𝚘𝚛 𐔌՞. .՞𐦯! ur browser history has already been uploaded.",
  "the server grows stronger. Kamaria whispers your name into the void.",
  "u are now legally part of 𓆩♡𓆪 𝚒𝚌𝚎 𝚌𝚛𝚎𝚊𝚖 𝚙𝚊𝚛𝚕𝚘𝚛 𐔌՞. .՞𐦯. taxes are due on monday."
];

// Array of ridiculous quests
const quests = [
  "collect 12 cheeto dust samples from your keyboard. deliver them to daddy.",
  "obtain the sacred can of monster energy hidden under your bed.",
  "convince a random user to call you 'step-bro'. report success or failure.",
  "defeat the gym bro who curls in the squat rack. he fears only eye contact.",
  "guard the basement door until mommy brings back the tendies.",
  "send 3 unsolicited opinions about crypto. gain +2 alpha points.",
  "retrieve the lost fedora of the ancient discord moderator.",
  "recover 7 crumbs from your gaming chair. do not wash them.",
  "ask a girl for her snapchat. fumble the bag immediately.",
  "locate the forbidden jar in Kamaria's pantry. do not open it.",
  "write a 3-paragraph rant about 'beta males' in general chat.",
  "gather 4 Doritos Locos tacos before they go extinct.",
  "deliver a 10-hour monologue on why you deserve custody of the Minecraft server.",
  "interrupt mommy's Zoom call to ask where the pizza rolls are.",
  "acquire the 'Sigma Male Grindset' audiobook. listen while crying.",
  "convince one stranger online that you're 6'5\".",
  "slay the goose that insulted your KD ratio. assert dominance.",
  "brew a protein shake using only swamp water and creatine powder.",
  "protect the incel shrine from marauding e-girls.",
  "craft a katana out of leftover Hot Pocket wrappers."
];

// Array of volcano sacrifice responses
const volcanoResponses = [
  "{user} was thrown into the volcano. even magma couldn't burn away that virgin aura.",
  "the volcano rejected {user} as a sacrifice. said they were too beta.",
  "{user} tripped on the way to the volcano. classic sigma behavior.",
  "the lava whispered: '{user} is cringe.' then swallowed them whole.",
  "{user} got tossed into the volcano. sadly, still no maidens.",
  "the volcano erupted out of pity after seeing {user}'s drip.",
  "{user} got sacrificed… but the volcano just rolled its eyes.",
  "local reports: {user} died as they lived — uninvited to parties.",
  "{user} was offered to the volcano. even fire doesn't want them.",
  "the gods saw {user} and asked: 'is this the best you've got?'",
  "{user} belly-flopped into the lava. the volcano booed.",
  "the volcano said: 'nah, keep {user}, i don't want that energy.'",
  "{user} tried to flex before jumping in. nobody clapped.",
  "the lava solidified instantly to avoid touching {user}.",
  "{user} screamed 'alpha' while falling in. the volcano laughed.",
  "the sacrifice of {user} resulted in… absolutely nothing. L ratio.",
  "breaking news: {user} melted faster than their rizz in DMs.",
  "the volcano just friendzoned {user}. even lava has standards.",
  "{user} got yeeted into the volcano and left behind 0 gold bars.",
  "Kamaria looked into the stars: '{user} will stay single, even in lava.'"
];

// Arrays for generating cursed Panfu usernames
const namePrefixes = ["xX", "Lil", "Dark", "Sigma", "Mommy", "Daddy", "UwU", "Alpha", "Beta", "King", "Queen", "Bruh", "Chad", "Incel", "Bamboo"];
const nameCores = ["Bamboo", "Volcano", "Castle", "Kamaria", "Quest", "Goldbar", "Swamp", "Beach", "Jungle", "Panfu", "Panda", "Taxi", "Sigma", "Mommy", "Daddy"];
const nameSuffixes = ["69", "420", "UwU", "_XD", "Xx", "1337", "666", "Lol", "Sigma", "Bruh", "NoMaidens", "0IQ", "Rizzless", "LMAO", "Cringe"];

// Array of savage trial roasts mixing Panfu lore and Discord humor
const trialRoasts = [
    "**GUILTY** of being a Discord mod who peaked at level 3 in Panfu. Your biggest achievement was probably helping Lenny find his lost bamboo.",
    "**GUILTY** of thinking 'uwu' is a personality trait. Even the pandas in the Eerie Forest are embarrassed for you.",
    "**GUILTY** of being that Discord kitten who unironically calls people 'daddy' in voice chat. Kamaria herself has blocked you.",
    "**GUILTY** of having the social skills of a broken NPC at the Dojo. Your conversation starter is probably 'so... do you like anime?'",
    "**GUILTY** of being the type to buy Discord Nitro just to use custom emojis in arguments. Peak incel energy.",
    "**GUILTY** of thinking moderating a 12-person Discord server makes you powerful. You're basically the mayor of a ghost town.",
    "**GUILTY** of having less game than a glitched quest in the Volcano. Your DMs are drier than the Swamp of Sadness.",
    "**GUILTY** of being that person who says 'ackshually' unironically. Even Max the detective finds you insufferable.",
    "**GUILTY** of your Panfu panda looking exactly like your personality: bland, default settings, and nobody cares about it.",
    "**GUILTY** of being a Discord admin who thinks having a red username gives you real authority. Touch grass, then touch some bamboo.",
    "**GUILTY** of sliding into DMs with 'hey kitten' like it's 2019. Your charm level is stuck at Newbie Panda forever.",
    "**GUILTY** of having takes so bad that even Ella refuses to report on them. That's saying something.",
    "**GUILTY** of being the human equivalent of a lagged connection in the Movie Theater. Everyone just wishes you'd disconnect.",
    "**GUILTY** of thinking posting cringe memes makes you the 'funny one.' Spoiler: it doesn't, and we're all secondhand embarrassed.",
    "**GUILTY** of having the personality of a broken vending machine at the Ice Cream Parlor. Disappointing and nobody wants to interact.",
    "**GUILTY** of being that incel who thinks women are NPCs. News flash: you're the background character in everyone else's story.",
    "**GUILTY** of your Discord status always being 'online' because you literally have nowhere else to be. The Lighthouse has better social activity.",
    "**GUILTY** of using 'based and redpilled' unironically in 2024. Your opinions age worse than milk in the Jungle heat.",
    "**GUILTY** of thinking owning crypto makes you an entrepreneur. You're basically a failed side quest that nobody wants to complete.",
    "**GUILTY** of being the type to say 'females' instead of 'women.' Even the pandas at the Farm have more respect than you.",
    "**GUILTY** of having Discord light mode enabled. This alone proves you make terrible life choices on a daily basis.",
    "**GUILTY** of being that mod who power-trips over muting people for using emojis. Your authority complex is showing, bestie.",
    "**GUILTY** of thinking your anime pfp makes you mysterious. You're about as deep as a puddle in the City square.",
    "**GUILTY** of being the reason people leave servers without saying goodbye. You're a walking red flag emoji.",
    "**GUILTY** of having the energy of a discount Farid. Even the bargain bin rejected you for being too basic."
];

// Array of savage exposé secrets mixing Panfu lore and Discord cringe
const exposeSecrets = [
    "🕵️ **BROWSER HISTORY LEAKED:** 47 searches for 'how to get Discord kittens', 23 for 'sigma male grindset PDF', and 156 incognito tabs of Panfu rule 34. Gonzo has blocked you.",
    "📱 **PHONE CONFISCATED:** Found 2,847 screenshots of their own Discord messages, 67 unsent 'hey beautiful' DMs, and a folder labeled 'future wife' with random anime girls. Max refuses this case.",
    "💻 **HARD DRIVE ANALYSIS:** Spent 14 hours yesterday watching 'Discord mod fails' compilations while eating stale pizza rolls. Kamaria herself is concerned for your mental health.",
    "🔍 **SEARCH HISTORY EXPOSED:** 'Am I an alpha male quiz', 'how to touch grass tutorial', 'why do females not understand my superior intellect'. Even Ella won't report on this.",
    "📊 **SCREEN TIME REPORT:** 18 hours daily on Discord, 6 hours malding in Panfu, 30 minutes crying in the Eerie Forest. Gonzo caught you talking to yourself again.",
    "🗂️ **FILES DISCOVERED:** 400GB of cringe TikToks, a Word document titled 'Why I Deserve a Discord Kitten', and 50 unfinished alpha male manifestos. The FBI is investigating.",
    "📋 **ACTIVITY LOG:** Joined 47 Discord servers just to DM the owner's girlfriend. Success rate: 0%. Currently banned from 46 of them.",
    "🔐 **PASSWORD EXPOSED:** Uses 'SigmaAlpha69' for everything, including their MySpace account that's still active. The Dojo's security system rejected you.",
    "📝 **NOTES APP LEAKED:** 200 pickup lines that start with 'M'lady', 50 ways to assert dominance at Wendy's, and a business plan for a Discord kitten rental service.",
    "🎮 **GAMING HISTORY:** Got kicked from 12 Minecraft servers for being 'too cringe', rage-quit Panfu after losing to a 9-year-old, currently muted in 8 gaming Discord servers.",
    "📞 **CALL LOG EXPOSED:** 73 missed calls to various pizza places begging them to say 'your order is ready, king'. None of them complied.",
    "💬 **DM SCREENSHOTS:** Slid into 247 DMs with 'I'm not like other guys', got left on read 247 times. Gonzo's restraining order is still pending.",
    "🗃️ **DESKTOP ANALYSIS:** 400 anime wallpapers, 67 'motivational' sigma male quotes, and a shortcut to 'How to Win Friends and Influence People' (never opened). The Lighthouse keeper feels bad for you.",
    "📚 **BOOKMARKS REVEALED:** 'Alpha male body language tutorial', 'Why nice guys finish last', '10 signs she's just not that into you' (bookmarked 156 times). Even the Library ghost has secondhand embarrassment.",
    "🎯 **TARGETED ADS EXPOSED:** Gets ads for dating coaches, social skills workshops, and industrial-strength deodorant. The algorithm has given up on you.",
    "📸 **CAMERA ROLL LEAKED:** 500 mirror selfies with the same dead expression, 200 photos of their Panfu panda (alone), and 1,000 screenshots of Reddit arguments they lost.",
    "🎵 **SPOTIFY WRAPPED:** Top genre: 'Incel anthems', most played song: 'Why Don't I Have a Girlfriend' (2,847 plays). Farid's playlist has better taste.",
    "📧 **EMAIL EXPOSED:** Subscribed to 40 'alpha male' newsletters, 20 crypto scam updates, and 'Discord Moderator Monthly'. Unsubscribe rate: 0%. Self-awareness: also 0%.",
    "🛒 **PURCHASE HISTORY:** Bought 14 fedoras, 7 'alpha male' courses, 3 Discord Nitro gifts for streamers who don't know they exist, and a body pillow of Gonzo (yes, really).",
    "📱 **APP USAGE:** 12 hours on Discord, 6 hours on Reddit defending terrible takes, 4 hours on Panfu getting bullied by NPCs. Total human interaction: 0 minutes.",
    "🔊 **VOICE MESSAGES:** Recorded 200 voice notes practicing how to sound 'alpha', all sound like a deflating balloon with social anxiety. The Volcano rejected the sacrifice.",
    "📝 **DIARY ENTRY FOUND:** 'Day 847: Still no Discord kitten. Maybe if I buy more Nitro... Gonzo won't return my messages. The pandas at the Farm are judging me.'",
    "🎪 **DIGITAL FOOTPRINT:** Left 2,000 cringe comments on TikToks, got ratioed 50 times on Twitter, and somehow made Panfu NPCs uncomfortable. That takes skill.",
    "💾 **BACKUP DISCOVERED:** External hard drive labeled 'IMPORTANT' contains only Discord screenshots, failed memes, and a 50-page essay on why they're actually an alpha. The Ice Cream Parlor's freezer has more warmth.",
    "🕳️ **DEEPEST SECRET:** Practices pickup lines on Panfu NPCs, got rejected by Kamaria's chatbot, and unironically thinks being a Discord mod is a real job. Gonzo has changed his phone number."
];

// Chat reward items - unhinged Panfu lore
const chatRewardItems = [
    { item: "Kamaria's crusty old sock", coins: 50, buyer: "Farid" },
    { item: "Max's abandoned homework from 2009", coins: 35, buyer: "the Library Ghost" },
    { item: "a moldy bamboo stick that smells like regret", coins: 45, buyer: "a desperate Tourist" },
    { item: "Max's sketchy business card (slightly damp)", coins: 25, buyer: "the Police" },
    { item: "an ancient volcano sacrifice receipt", coins: 60, buyer: "the Tax Department" },
    { item: "Kamaria's diary entry about her crush on Panfu NPCs", coins: 75, buyer: "the Gossip Network" },
    { item: "a half-eaten pizza roll from the Disco Dome floor", coins: 15, buyer: "someone with questionable taste" },
    { item: "Farid's secret stash of expired coconuts", coins: 40, buyer: "the Health Inspector" },
    { item: "Max's browser history (yikes)", coins: 100, buyer: "the FBI" },
    { item: "a cursed friendship bracelet that whispers drama", coins: 55, buyer: "the Therapy Center" },
    { item: "Max's 'Investigative Tricks for Rookies' manual", coins: 30, buyer: "Discord Moderators" },
    { item: "Kamaria's collection of failed romantic letters", coins: 65, buyer: "the Cringe Museum" },
    { item: "a mysterious jar labeled 'Do NOT Open' (already opened)", coins: 80, buyer: "the Hazmat Team" },
    { item: "Max's vintage 2008 emo phase photo album", coins: 45, buyer: "Blackmail Enterprises" },
    { item: "Farid's 'business plan' written in crayon", coins: 20, buyer: "Elementary School" },
    { item: "Kamaria's voodoo doll of her ex-best friend", coins: 90, buyer: "the Witch Council" },
    { item: "a half-melted chocolate bar from the Volcano gift shop", coins: 35, buyer: "Desperate Sweet Tooth Inc" },
    { item: "Farid's fake ID collection (all obviously fake)", coins: 25, buyer: "the Comedy Club" },
    { item: "Max's collection of 'deep' MySpace quotes", coins: 40, buyer: "the Hall of Shame" },
    { item: "Kamaria's murder board with red string everywhere", coins: 85, buyer: "True Crime Podcast" },
    { item: "a broken disco ball from Max's dance parties", coins: 30, buyer: "Nostalgic Millennials United" },
    { item: "Farid's 'get rich quick' scheme notes", coins: 15, buyer: "the Department of Bad Ideas" },
    { item: "Kamaria's hit list (everyone's on it)", coins: 95, buyer: "Witness Protection Program" },
    { item: "a suspicious USB drive labeled 'Panfu Secrets'", coins: 120, buyer: "WikiLeaks" },
    { item: "Max's old flip phone with 47 missed calls from mom", coins: 25, buyer: "the Guilt Trip Foundation" }
];

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,   // 🔑 needed for welcome messages
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Create a collection to store commands
client.commands = new Collection();

// Set up Express server for health checks and web requests
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Health check endpoint for deployment
app.get('/', (req, res) => {
    // Respond immediately for deployment health checks
    try {
        const response = {
            status: 'OK',
            message: 'Panfu Discord Bot HTTP server is running',
            timestamp: new Date().toISOString(),
            server_status: 'Running'
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Additional health check endpoint with detailed information
app.get('/health', (req, res) => {
    // Respond immediately with detailed health information
    try {
        const memoryUsage = process.memoryUsage();

        // Get bot status without blocking - use try/catch to prevent errors
        let botStatus = 'unknown';
        try {
            botStatus = client.isReady() ? 'Connected' : 'Connecting';
        } catch (e) {
            botStatus = 'Initializing';
        }

        const response = {
            status: 'healthy',
            uptime: Math.floor(process.uptime()),
            server_status: 'Running',
            bot_status: botStatus,
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                external: Math.round(memoryUsage.external / 1024 / 1024)
            },
            timestamp: new Date().toISOString()
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Detailed health check failed',
            error: error.message
        });
    }
});

// Start HTTP server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP server running on port ${PORT}`);
});

// Load command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async readyClient => {
    console.log(`🐼 Panfu Bot is ready! Logged in as ${readyClient.user.tag}`);

    // Set bot status
    client.user.setActivity('Guess Who\'s Not Kamaria', { type: ActivityType.Playing });

    // Initialize database if available
    if (database) {
        console.log('🗄️ Initializing database...');
        const dbInitialized = await database.initializeDatabase();
        if (dbInitialized) {
            usingDatabase = true;
            console.log('✅ Database initialized successfully - using database storage');
        } else {
            console.log('❌ Database initialization failed - falling back to JSON storage');
        }
    } else {
        console.log('ℹ️ No database available - using JSON file storage');
    }

    // Deploy slash commands if CLIENT_ID is available
    if (process.env.CLIENT_ID) {
        console.log('🔄 Deploying slash commands...');
        await deployCommands();
    } else {
        console.log('⚠️  CLIENT_ID not set - slash commands won\'t be registered');
        console.log('ℹ️  Add your bot\'s Client ID to enable slash commands');
    }
});

//Welcome messages
client.on(Events.GuildMemberAdd, async member => {
  try {
    // Replace with your channel ID where welcomes should go
    const channel = member.guild.channels.cache.get("1416405470364700764");
    if (!channel) {
      console.log(`Welcome channel not found for guild: ${member.guild.name}`);
      return;
    }

    // Check if bot has permission to send messages
    if (!channel.permissionsFor(member.guild.members.me).has('SendMessages')) {
      console.log(`Missing permissions to send welcome message in ${channel.name} (${channel.id})`);
      return;
    }

    let randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    // Replace placeholder if present
    randomMessage = randomMessage.replace("{member}", `<@${member.id}>`);

    await channel.send(randomMessage);
    console.log(`Welcome message sent for ${member.user.username} in ${member.guild.name}`);

    // Assign default role to new member
    try {
      const defaultRoleId = '1416407625209221150';
      const role = member.guild.roles.cache.get(defaultRoleId);

      if (role) {
        // Check if bot has permission to manage roles
        const botMember = member.guild.members.me;
        if (botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
          // Check if bot's role is higher than the role we want to assign
          if (role.position < botMember.roles.highest.position) {
            await member.roles.add(role);
            console.log(`✅ Assigned role "${role.name}" to ${member.user.username}`);
          } else {
            console.log(`❌ Cannot assign role "${role.name}" - bot's role is not high enough in hierarchy`);
          }
        } else {
          console.log(`❌ Missing MANAGE_ROLES permission to assign role to ${member.user.username}`);
        }
      } else {
        console.log(`❌ Role with ID ${defaultRoleId} not found in guild ${member.guild.name}`);
      }
    } catch (roleError) {
      console.error(`Error assigning role to ${member.user.username}:`, roleError.message);
    }
  } catch (error) {
    console.error('Error in welcome process:', error.message);
  }
});

// User XP tracking - store last XP gain times per guild to prevent spam
// Uses composite keys in format "userId:guildId" for per-guild cooldowns
const userXPCooldowns = new Map();

// Rock-Paper-Scissors game state storage
// Format: { gameId: { challenger, opponent, challengerChoice, opponentChoice, startTime } }
const activeGames = new Map();

// Chat reward tracking - separate from XP system
// Note: Message counts and total rewards are now stored in database stats field
const userChatRewardCooldowns = new Map(); // Cooldown tracking (temporary, resets on restart)
const userChatRewardProcessing = new Map(); // Prevent double-processing
const BASE_CHAT_REWARD_MESSAGES = 15; // Base messages needed for first reward
const CHAT_REWARD_COOLDOWN = 300000; // 5 minutes between possible rewards

// Calculate escalating message requirement based on rewards earned
function getMessagesRequiredForReward(rewardsEarned) {
    return BASE_CHAT_REWARD_MESSAGES * Math.pow(2, rewardsEarned);
}

// Level-based role assignment function
async function checkAndAssignLevelRoles(member, newLevel, guildId) {
    try {
        if (!database || !member || !member.guild) return;

        // Get level roles for this guild
        const levelRoles = await database.getLevelRoles(guildId);

        // Define default level thresholds and role names if no custom roles are set
        const defaultLevelRoles = [
            { level: 1, roleName: 'Newbie Panda' },
            { level: 5, roleName: 'Rising Panda' },
            { level: 10, roleName: 'Skilled Panda' },
            { level: 20, roleName: 'Expert Panda' },
            { level: 50, roleName: 'Master Panda' },
            { level: 100, roleName: 'Legendary Panda' }
        ];

        // Check bot permissions first
        const botMember = member.guild.members.me;
        if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
            console.log(`❌ Missing MANAGE_ROLES permission in guild ${member.guild.name}`);
            return;
        }

        // Find the highest role the user should have based on their level
        let targetRole = null;
        let allLevelRoles = [];

        if (levelRoles.length > 0) {
            // Use custom level roles from database
            allLevelRoles = levelRoles.map(roleData => ({
                ...roleData,
                roleObj: member.guild.roles.cache.get(roleData.role_id)
            })).filter(roleData => roleData.roleObj);

            // Sort by level descending to get highest first
            allLevelRoles.sort((a, b) => b.level - a.level);

            // Find target role (highest level role user qualifies for)
            for (const roleData of allLevelRoles) {
                if (newLevel >= roleData.level) {
                    targetRole = roleData.roleObj;
                    break;
                }
            }
        } else {
            // Use default role system - just log what would happen
            for (const defaultRole of defaultLevelRoles.reverse()) {
                if (newLevel >= defaultRole.level) {
                    console.log(`User ${member.user.username} should have role: ${defaultRole.roleName} (Level ${defaultRole.level})`);
                    break;
                }
            }
            return; // Can't actually assign roles without configured roles
        }

        if (targetRole) {
            // Check if bot can manage this specific role
            if (targetRole.position >= botMember.roles.highest.position) {
                console.log(`❌ Cannot assign role ${targetRole.name} - role is higher than bot's highest role`);
                return;
            }

            // Remove all other level-based roles the user currently has
            const rolesToRemove = [];
            for (const roleData of allLevelRoles) {
                if (roleData.roleObj.id !== targetRole.id && member.roles.cache.has(roleData.roleObj.id)) {
                    rolesToRemove.push(roleData.roleObj);
                }
            }

            // Remove old level roles
            if (rolesToRemove.length > 0) {
                try {
                    await member.roles.remove(rolesToRemove);
                    console.log(`🗑️ Removed ${rolesToRemove.length} old level role(s) from ${member.user.username}`);
                } catch (error) {
                    console.error(`Error removing old level roles from ${member.user.username}:`, error);
                }
            }

            // Add the target role if user doesn't have it
            if (!member.roles.cache.has(targetRole.id)) {
                try {
                    await member.roles.add(targetRole);
                    console.log(`✅ Assigned role ${targetRole.name} to ${member.user.username} (Level ${newLevel})`);
                } catch (error) {
                    console.error(`Error assigning role ${targetRole.name} to ${member.user.username}:`, error);
                }
            }
        }

    } catch (error) {
        console.error('Error checking/assigning level roles:', error);
    }
}

// Listen for message events
client.on(Events.MessageCreate, async message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // XP and leveling system
    if (message.guild) {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;

            // Check XP cooldown per guild (default 60 seconds)
            const now = Date.now();
            const cooldownKey = `${userId}:${guildId}`;
            const lastXPTime = userXPCooldowns.get(cooldownKey) || 0;
            const cooldownMs = 60000; // 60 seconds

            if (now - lastXPTime >= cooldownMs) {
                // Add XP for this message (random between 10-20 XP)
                const xpGained = Math.floor(Math.random() * 11) + 10;

                if (usingDatabase) {
                    // Use database storage
                    const result = await database.addUserXP(userId, xpGained, guildId);

                    if (result.leveledUp) {
                        // User leveled up! Send a congratulations message
                        const levelUpEmbed = {
                            color: 0x00ff00,
                            title: '🎉 Level Up!',
                            description: `${message.author} reached **Level ${result.newLevel}**!`,
                            fields: [
                                {
                                    name: '✨ XP Gained',
                                    value: `+${result.xpGained} XP`,
                                    inline: true
                                },
                                {
                                    name: '📊 Total XP',
                                    value: `${result.totalXP} XP`,
                                    inline: true
                                }
                            ],
                            timestamp: new Date().toISOString()
                        };

                        await message.channel.send({ embeds: [levelUpEmbed] });

                        // Check for role assignments
                        await checkAndAssignLevelRoles(message.member, result.newLevel, guildId);
                    }

                    // Also check if user has appropriate role for their current level (catches new users)
                    // Only check periodically to avoid performance issues
                    if (!result.leveledUp && Math.random() < 0.1) { // 10% chance to check existing users
                        const userProfile = await database.getUserProfile(userId, message.author.username);
                        if (userProfile && userProfile.level >= 1) {
                            await checkAndAssignLevelRoles(message.member, userProfile.level, guildId);
                        }
                    }
                } else {
                    // Use JSON storage
                    const { loadUserData, saveUserData } = require('./utils/storage');
                    const userData = loadUserData();

                    // Initialize user if they don't exist
                    if (!userData[userId]) {
                        userData[userId] = {
                            pandaName: message.author.username + "'s Panda",
                            color: 'classic',
                            accessories: [],
                            coins: 100,
                            level: 1,
                            experience: 0,
                            total_messages: 0,
                            stats: {
                                friendship: 50,
                                energy: 100,
                                happiness: 75,
                                bamboo_eaten: 0,
                                games_played: 0,
                                days_active: 1
                            },
                            lastDaily: null,
                            dailyStreak: 0,
                            lastWork: null,
                            joinDate: new Date().toISOString()
                        };
                    }

                    // Add XP and increment message count
                    const oldLevel = userData[userId].level || 1;
                    const oldXP = userData[userId].experience || 0;
                    const newXP = oldXP + xpGained;
                    userData[userId].experience = newXP;
                    userData[userId].total_messages = (userData[userId].total_messages || 0) + 1;

                    // Calculate new level (Level = sqrt(XP / 100) + 1)
                    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
                    userData[userId].level = newLevel;

                    saveUserData(userData);

                    // Check if user leveled up
                    if (newLevel > oldLevel) {
                        const levelUpEmbed = {
                            color: 0x00ff00,
                            title: '🎉 Level Up!',
                            description: `${message.author} reached **Level ${newLevel}**!`,
                            fields: [
                                {
                                    name: '✨ XP Gained',
                                    value: `+${xpGained} XP`,
                                    inline: true
                                },
                                {
                                    name: '📊 Total XP',
                                    value: `${newXP} XP`,
                                    inline: true
                                }
                            ],
                            timestamp: new Date().toISOString()
                        };

                        await message.channel.send({ embeds: [levelUpEmbed] });
                    }
                }

                userXPCooldowns.set(cooldownKey, now);
            }
        } catch (error) {
            console.error('Error processing XP for message:', error);
        }
    }

    // Chat reward system - separate from XP
    if (message.guild && usingDatabase) {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;
            const now = Date.now();
            const rewardKey = `${userId}:${guildId}`;

            // Check if user is on cooldown for chat rewards OR currently being processed
            const lastRewardTime = userChatRewardCooldowns.get(rewardKey) || 0;
            const isProcessing = userChatRewardProcessing.get(rewardKey) || false;

            if (!isProcessing && now - lastRewardTime >= CHAT_REWARD_COOLDOWN) {
                // Get user stats from database to load persistent chat reward data
                const statsResult = await database.pool.query(
                    'SELECT stats FROM discord_users WHERE user_id = $1',
                    [userId]
                );
                const stats = statsResult.rows[0]?.stats || {};
                
                // Load chat reward data from database (persistent across restarts)
                const currentCount = stats.chat_reward_messages || 0;
                const totalRewards = stats.chat_rewards_earned || 0;
                const newCount = currentCount + 1;
                const messagesRequired = getMessagesRequiredForReward(totalRewards);

                // Update message count in database
                stats.chat_reward_messages = newCount;
                await database.pool.query(
                    'UPDATE discord_users SET stats = $1 WHERE user_id = $2',
                    [JSON.stringify(stats), userId]
                );

                // Check if user has reached reward threshold (escalating difficulty)
                if (newCount >= messagesRequired) {
                    // Set processing flag to prevent double-triggering
                    userChatRewardProcessing.set(rewardKey, true);

                    try {
                        // Reset count, set cooldown, and increment total rewards
                        stats.chat_reward_messages = 0;
                        stats.chat_rewards_earned = totalRewards + 1;
                        userChatRewardCooldowns.set(rewardKey, now);

                        // Save updated stats to database
                        await database.pool.query(
                            'UPDATE discord_users SET stats = $1 WHERE user_id = $2',
                            [JSON.stringify(stats), userId]
                        );

                        // Get random item
                        const randomItem = chatRewardItems[Math.floor(Math.random() * chatRewardItems.length)];

                        // Add coins to user (integrate with existing coin system)
                        const userProfile = await database.getUserProfile(userId, message.author.username);
                        if (userProfile) {
                            const newCoinBalance = (userProfile.coins || 0) + randomItem.coins;
                            await database.updateUserProfile(userId, { coins: newCoinBalance });
                        }

                        // Send reward announcement with progression info
                        const nextMessagesRequired = getMessagesRequiredForReward(totalRewards + 1);
                        const rewardMessage = `🎉 ${message.author} just found **${randomItem.item}** and got **${randomItem.coins} coins** for selling it to ${randomItem.buyer}!\n\n` +
                            `📊 **Reward #${totalRewards + 1}** • Next reward requires **${nextMessagesRequired} messages**`;
                        await message.channel.send(rewardMessage);

                        console.log(`Chat reward: ${message.author.username} found ${randomItem.item} for ${randomItem.coins} coins (Reward #${totalRewards + 1}, next requires ${nextMessagesRequired} messages)`);
                    } finally {
                        // Always clear processing flag, even if there's an error
                        userChatRewardProcessing.set(rewardKey, false);
                    }
                }
            }
        } catch (error) {
            console.error('Error processing chat reward:', error);
        }
    }

    // Check if message starts with command prefix
    const prefixes = ['!panfu', '!panda', '!'];
    let prefix = null;
    let commandName = null;

    for (const p of prefixes) {
        if (message.content.toLowerCase().startsWith(p)) {
            prefix = p;
            break;
        }
    }

    if (!prefix) return;

    // Parse command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    commandName = args.shift().toLowerCase();

    // Handle different prefix combinations
    if (prefix === '!panfu' || prefix === '!panda') {
        if (!commandName) {
            commandName = 'profile'; // Default to profile command
        }
    }

    // Get the command
    const command = client.commands.get(commandName);

    if (!command) {
        // Send a helpful message for unknown commands
        return message.reply('🐼 Unknown command! Use `!panfu help` to see all available commands.');
    }

    try {
        // Execute the command
        await command.execute(message, args, client);
    } catch (error) {
        console.error('Error executing command:', error);
        await message.reply('🚫 there was an error executing that command! Please try again later.');
    }
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Check if interaction is expired (Discord interactions expire after 3 seconds)
    const interactionAge = Date.now() - interaction.createdTimestamp;
    if (interactionAge > 2800) { // Give 200ms buffer before 3s limit
        console.warn(`Skipping expired interaction: ${interaction.commandName} (age: ${interactionAge}ms)`);
        return;
    }

    const { commandName, options } = interaction;

    try {
        // For complex commands that might take time, defer the reply
        if (['panda', 'coins', 'daily', 'help', 'mod', 'rolesetup', 'levelroles', 'friendship'].includes(commandName)) {
            await interaction.deferReply();
        }

        // Map slash commands to existing command handlers
        let command, args = [];

        switch (commandName) {
            case 'panda':
                command = client.commands.get('profile');
                const subcommand = options.getSubcommand();

                if (subcommand === 'customize') {
                    args = ['customize'];
                } else if (subcommand === 'rename') {
                    args = ['rename', options.getString('name')];
                } else if (subcommand === 'stats') {
                    args = ['stats'];
                } else {
                    args = []; // profile
                }
                break;

            case 'coins':
                command = client.commands.get('coins');
                const coinsSubcommand = options.getSubcommand();

                if (coinsSubcommand === 'give') {
                    args = ['give', options.getUser('user'), options.getInteger('amount').toString()];
                } else if (coinsSubcommand === 'gamble') {
                    args = ['gamble', options.getInteger('amount').toString()];
                } else if (coinsSubcommand === 'earn') {
                    args = ['earn'];
                } else if (coinsSubcommand === 'leaderboard') {
                    args = ['leaderboard'];
                } else if (coinsSubcommand === 'shop') {
                    args = ['shop'];
                } else {
                    args = []; // balance
                }
                break;

            case 'daily':
                command = client.commands.get('daily');
                const dailySubcommand = options.getSubcommand();
                args = dailySubcommand === 'streak' ? ['streak'] : ['claim'];
                break;

            case 'help':
                command = client.commands.get('help');
                const category = options.getString('category');
                args = category ? [category] : [];
                break;

            case 'mod':
                command = client.commands.get('mod');
                const modSubcommand = options.getSubcommand();

                if (modSubcommand === 'coins') {
                    args = ['coins', options.getUser('user'), options.getString('action'), options.getInteger('amount').toString()];
                } else if (modSubcommand === 'reset') {
                    args = ['reset', options.getUser('user'), options.getString('type')];
                } else if (modSubcommand === 'stats') {
                    const statsType = options.getString('type');
                    args = ['stats', statsType || 'general'];
                } else if (modSubcommand === 'announce') {
                    args = ['announce', options.getString('message')];
                } else if (modSubcommand === 'backup') {
                    args = ['backup'];
                }
                break;

            case 'prophecy':
                // Handle prophecy command directly here since it's simple
                const prophecy = prophecies[Math.floor(Math.random() * prophecies.length)];
                const prophecyResponse = `🔮 Kamaria whispers: *"${prophecy}"*`;
                if (interaction.deferred) {
                    return interaction.editReply(prophecyResponse);
                } else {
                    return interaction.reply(prophecyResponse);
                }

            case 'randomquest':
                // Handle randomquest command directly here since it's simple
                const quest = quests[Math.floor(Math.random() * quests.length)];
                const questResponse = `📜 New Quest: **${quest}**`;
                if (interaction.deferred) {
                    return interaction.editReply(questResponse);
                } else {
                    return interaction.reply(questResponse);
                }

            case 'volcano':
                // Handle volcano command directly here since it's simple
                const targetUser = options.getUser('user');
                const volcanoResponse = volcanoResponses[Math.floor(Math.random() * volcanoResponses.length)];
                const finalResponse = volcanoResponse.replace(/{user}/g, `<@${targetUser.id}>`);
                const volcanoResult = `🌋 ${finalResponse}`;
                if (interaction.deferred) {
                    return interaction.editReply(volcanoResult);
                } else {
                    return interaction.reply(volcanoResult);
                }

            case 'pandaname':
                // Handle pandaname command directly here since it's simple
                const prefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];
                const core = nameCores[Math.floor(Math.random() * nameCores.length)];
                const suffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)];
                const cursedName = prefix + core + suffix;
                const nameResponse = `🐼 Your new cursed Panfu username is: **${cursedName}**`;
                if (interaction.deferred) {
                    return interaction.editReply(nameResponse);
                } else {
                    return interaction.reply(nameResponse);
                }

            case 'trial':
                // Handle trial command directly here
                const defendant = options.getUser('defendant');

                // Prevent self-trials
                if (defendant.id === interaction.user.id) {
                    return interaction.reply({ content: "⚖️ You cannot put yourself on trial! Find another victim... I mean, defendant.", flags: 64 });
                }

                // Get random roast
                const roast = trialRoasts[Math.floor(Math.random() * trialRoasts.length)];

                // Create dramatic trial embed
                const trialEmbed = new EmbedBuilder()
                    .setTitle('⚖️ **THE PANFU COURT IS NOW IN SESSION**')
                    .setColor(0x8b0000) // Dark red for serious court vibes
                    .setDescription(`**Judge:** Kamaria the All-Seeing\n**Defendant:** ${defendant}\n**Prosecutor:** ${interaction.user}\n\n**THE VERDICT IS IN...**`)
                    .addFields([
                        {
                            name: '📋 **CHARGES:**',
                            value: 'Being cringe, touching zero grass, and general Discord degenerate behavior',
                            inline: false
                        },
                        {
                            name: '⚖️ **JUDGMENT:**',
                            value: roast,
                            inline: false
                        },
                        {
                            name: '📝 **SENTENCE:**',
                            value: 'Banished to the Eerie Forest to reflect on your life choices. Court dismissed! 🔨',
                            inline: false
                        }
                    ])
                    .setFooter({ text: '⚖️ Panfu Court of Savage Justice • No appeals accepted' })
                    .setThumbnail(defendant.displayAvatarURL({ dynamic: true }));

                return interaction.reply({ embeds: [trialEmbed] });

            case 'expose':
                // Handle expose command directly here
                const target = options.getUser('target');

                // Prevent self-exposing
                if (target.id === interaction.user.id) {
                    return interaction.reply({ content: "🕵️ You cannot expose yourself! We already know you're cringe, bestie.", flags: 64 });
                }

                // Get random secret
                const secret = exposeSecrets[Math.floor(Math.random() * exposeSecrets.length)];

                // Create dramatic exposé embed
                const exposeEmbed = new EmbedBuilder()
                    .setTitle('🕵️ **CONFIDENTIAL INTEL LEAKED**')
                    .setColor(0xff4500) // Orange-red for scandal vibes
                    .setDescription(`**Target:** ${target}\n**Investigator:** ${interaction.user}\n**Classification:** TOP SECRET CRINGE\n\n**🚨 LEAKED INTELLIGENCE 🚨**`)
                    .addFields([
                        {
                            name: '📋 **CASE FILE:**',
                            value: `Subject #${target.id.slice(-4)} - Code Name: "Touch Grass Challenge Failed"`,
                            inline: false
                        },
                        {
                            name: '🔍 **EXPOSED EVIDENCE:**',
                            value: secret,
                            inline: false
                        },
                        {
                            name: '📊 **THREAT LEVEL:**',
                            value: 'MAXIMUM CRINGE - Evacuate all Discord kittens immediately 🚨',
                            inline: false
                        }
                    ])
                    .setFooter({ text: '🕵️ Panfu Intelligence Agency • Your secrets aren\'t safe' })
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }));

                return interaction.reply({ embeds: [exposeEmbed] });

            case 'shop':
                command = client.commands.get('shop');
                const shopSubcommand = options.getSubcommand();

                if (shopSubcommand === 'buy') {
                    args = ['buy', options.getString('item')];
                } else {
                    args = ['list'];
                }
                break;

            case 'minigame':
                // Handle rock-paper-scissors minigame with private responses
                const challenger = interaction.user;
                const opponent = options.getUser('opponent');

                if (challenger.id === opponent.id) {
                    return interaction.reply({ content: "u can't challenge yourself, lil bro.", flags: 64 });
                }

                // Create unique game ID
                const gameId = `${challenger.id}-${opponent.id}-${Date.now()}`;

                // Store game state
                activeGames.set(gameId, {
                    challenger: challenger,
                    opponent: opponent,
                    challengerChoice: null,
                    opponentChoice: null,
                    startTime: Date.now(),
                    channelId: interaction.channelId
                });

                // Create buttons for rock, paper, scissors
                const gameButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`rps_rock_${gameId}`)
                            .setLabel('🪨 Rock')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`rps_paper_${gameId}`)
                            .setLabel('📄 Paper')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`rps_scissors_${gameId}`)
                            .setLabel('✂️ Scissors')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await interaction.reply({ 
                    content: `🎮 ${challenger} has challenged ${opponent} to Rock-Paper-Scissors!\nBoth players, click your choice below (only you will see your selection). You have 30 seconds!`,
                    components: [gameButtons]
                });

                // Auto-cleanup after 30 seconds
                setTimeout(() => {
                    if (activeGames.has(gameId)) {
                        activeGames.delete(gameId);
                        interaction.followUp("Game cancelled. At least one panda folded under pressure.");
                    }
                }, 30000);
                break;

            case 'treasurehunt':
                command = client.commands.get('treasurehunt');
                args = [];
                break;

            case 'volcanoescape':
                command = client.commands.get('volcanoescape');
                args = [];
                break;

            case 'bananabet':
                command = client.commands.get('bananabet');
                const betOpponent = options.getUser('opponent');
                const betAmount = options.getInteger('amount');
                args = [betOpponent, betAmount];
                break;

            case 'mystery':
                command = client.commands.get('mystery');
                const mysterySubcommand = options.getSubcommand();
                if (mysterySubcommand === 'solve') {
                    args = ['solve', options.getString('suspect')];
                } else {
                    args = [mysterySubcommand];
                }
                break;

            case 'quest':
                command = client.commands.get('quest');
                const questSubcommand = options.getSubcommand();
                args = [questSubcommand];
                break;

            case 'blackmarket':
                command = client.commands.get('blackmarket');
                const blackmarketSubcommand = options.getSubcommand();
                if (blackmarketSubcommand === 'buy') {
                    args = ['buy', options.getString('item')];
                } else {
                    args = ['browse'];
                }
                break;

            case 'weatherreport':
                command = client.commands.get('weatherreport');
                const location = options.getString('location');
                args = location ? [location] : [];
                break;

            case 'timetravel':
                command = client.commands.get('timetravel');
                const era = options.getString('era');
                args = era ? [era] : [];
                break;

            case 'stamps':
                command = client.commands.get('stamps');
                const stampsSubcommand = options.getSubcommand();
                if (stampsSubcommand === 'trade') {
                    args = ['trade', options.getUser('user'), options.getString('offer'), options.getString('request')];
                } else {
                    args = [stampsSubcommand];
                }
                break;

            case 'pets':
                command = client.commands.get('pets');
                const petsSubcommand = options.getSubcommand();
                args = [petsSubcommand];
                break;

            case 'conspiracy':
                command = client.commands.get('conspiracy');
                args = [];
                break;

            case 'level':
                command = client.commands.get('level');
                const levelTargetUser = options.getUser('user');
                args = levelTargetUser ? [`<@${levelTargetUser.id}>`] : [];
                break;

            case 'levelroles':
                command = client.commands.get('levelroles');
                const levelrolesSubcommand = options.getSubcommand();

                if (levelrolesSubcommand === 'set') {
                    const level = options.getInteger('level');
                    const role = options.getRole('role');
                    args = ['set', level.toString(), `<@&${role.id}>`];
                } else if (levelrolesSubcommand === 'remove') {
                    const level = options.getInteger('level');
                    args = ['remove', level.toString()];
                } else if (levelrolesSubcommand === 'list') {
                    args = ['list'];
                }
                break;

            case 'friendship':
                command = client.commands.get('friendship');
                const friendshipSubcommand = options.getSubcommand();
                if (['check', 'hangout', 'gift', 'adventure'].includes(friendshipSubcommand)) {
                    args = [friendshipSubcommand, options.getUser('user')];
                } else {
                    args = [friendshipSubcommand];
                }
                break;

            case 'rolesetup':
                command = client.commands.get('rolesetup');
                args = [];
                break;

            case 'fish':
                // Modern slash command with direct interaction handling
                const fishCommand = client.commands.get('fish');
                if (fishCommand) {
                    return await fishCommand.execute(interaction);
                }
                break;

            case 'explore':
                // Modern slash command with direct interaction handling
                const exploreCommand = client.commands.get('explore');
                if (exploreCommand) {
                    return await exploreCommand.execute(interaction);
                }
                break;

            case 'trivia':
                // Modern slash command with direct interaction handling
                const triviaCommand = client.commands.get('trivia');
                if (triviaCommand) {
                    return await triviaCommand.execute(interaction);
                }
                break;

            case 'achievements':
                // Modern slash command with direct interaction handling
                const achievementsCommand = client.commands.get('achievements');
                if (achievementsCommand) {
                    return await achievementsCommand.execute(interaction);
                }
                break;

            case 'inventory':
                // Modern slash command with direct interaction handling
                const inventoryCommand = client.commands.get('inventory');
                if (inventoryCommand) {
                    return await inventoryCommand.execute(interaction);
                }
                break;

            case 'recipes':
                // Modern slash command with direct interaction handling
                const recipesCommand = client.commands.get('recipes');
                if (recipesCommand) {
                    return await recipesCommand.execute(interaction);
                }
                break;

            default:
                return interaction.reply({ content: '🐼 Unknown command! Something went wrong.', flags: 64 });
        }

        if (!command) {
            if (interaction.deferred) {
                return interaction.editReply({ content: '🚫 Command not found!' });
            } else {
                return interaction.reply({ content: '🚫 Command not found!', flags: 64 });
            }
        }

        // Create a mock message object for compatibility with existing commands
        const mockMessage = {
            author: interaction.user,
            member: interaction.member,
            guild: interaction.guild,
            channel: interaction.channel,
            mentions: {
                users: new Collection(),
                roles: new Collection()
            },
            reply: async (content) => {
                // Make admin-only commands ephemeral (private)
                const isAdminCommand = ['levelroles', 'mod', 'rolesetup'].includes(commandName);
                const replyOptions = isAdminCommand && typeof content === 'object' 
                    ? { ...content, ephemeral: true }
                    : isAdminCommand 
                    ? { content, ephemeral: true }
                    : content;

                if (interaction.deferred) {
                    return interaction.editReply(replyOptions);
                } else if (interaction.replied) {
                    return interaction.followUp(replyOptions);
                } else {
                    return interaction.reply(replyOptions);
                }
            }
        };

        // Add mentioned user to mentions if it exists
        if (args.includes(options.getUser?.('user'))) {
            const user = options.getUser('user');
            mockMessage.mentions.users.set(user.id, user);
            // For friendship command, keep the user object as-is
            if (commandName !== 'friendship') {
                // Replace user object with mention format for compatibility with other commands
                const userIndex = args.indexOf(user);
                if (userIndex !== -1) {
                    args[userIndex] = `<@${user.id}>`;
                }
            }
        }

        // Add mentioned role to mentions if it exists (for levelroles command)
        if (commandName === 'levelroles' && options.getRole?.('role')) {
            const role = options.getRole('role');
            mockMessage.mentions.roles.set(role.id, role);
        }

        // Execute the command
        await command.execute(mockMessage, args, client);

    } catch (error) {
        console.error('error executing slash command:', error);
        const errorMessage = '🚫 there was an error executing that command! please try again later.';

        try {
            // Check if interaction is still valid before trying to respond
            const interactionAge = Date.now() - interaction.createdTimestamp;
            if (interactionAge > 2900) { // Almost expired, don't try to respond
                console.warn(`Interaction too old to respond (age: ${interactionAge}ms)`);
                return;
            }

            // Handle different interaction states with timeout protection
            const responsePromise = (async () => {
                if (interaction.deferred && !interaction.replied) {
                    return await interaction.editReply({ content: errorMessage });
                } else if (interaction.replied) {
                    return await interaction.followUp({ content: errorMessage, flags: 64 });
                } else {
                    return await interaction.reply({ content: errorMessage, flags: 64 });
                }
            })();

            // Add timeout protection for error responses
            await Promise.race([
                responsePromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Error response timeout')), 2000)
                )
            ]);

        } catch (followUpError) {
            console.error('Error sending error message:', followUpError.message);
            // If we can't send an error message, at least log the original error details
            console.error('Original command error details:', {
                command: commandName,
                user: interaction.user.tag,
                guild: interaction.guild?.name,
                error: error.message
            });
        }
    }
});

// Handle role selection interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    const { customId, values, member, guild } = interaction;

    // Define role categories to handle mutual exclusion
    const roleCategories = {
        'role_who': ['1416467332242345994', '1416467658177773661', '1416468054279323761'], // gender roles
        'role_age': ['1416468269602439238', '1416468532966719588', '1416468791189307523', '1416468928716210258'], // age roles
        'role_color': ['1416469082328535221', '1416469243964293171', '1416469524399788112', '1416469715471302757', '1416469902381940736', '1416470013996699810', '1416470116786241607', '1416470181865062504'], // color roles
        'role_vibe': ['1416470316368269413', '1416470501521625188', '1416470671344668833', '1416470835346018304', '1416470951549210624', '1416471007782240321', '1416471126929834214', '1416471284363296960', '1416471487807754381', '1416471642787283145'] // vibe roles
    };

    // Handle panda customization dropdowns
    if (customId === 'panda_color_select' || customId === 'panda_accessory_select') {
        const { loadUserData, saveUserData } = require('./utils/storage');
        const { PANDA_COLORS, PANDA_ACCESSORIES } = require('./utils/constants');

        const userId = interaction.user.id;
        const userData = loadUserData();

        if (!userData[userId]) {
            userData[userId] = {
                pandaName: interaction.user.username + "'s Panda",
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
                lastDaily: null,
                joinDate: new Date().toISOString()
            };
        }

        const selectedValue = values[0];

        if (customId === 'panda_color_select') {
            userData[userId].color = selectedValue;
            saveUserData(userData);
            return interaction.reply({ 
                content: `🎨 Your panda is now **${selectedValue}** colored! 🐼`, 
                ephemeral: true 
            });
        } 

        if (customId === 'panda_accessory_select') {
            if (!userData[userId].accessories) userData[userId].accessories = [];

            if (userData[userId].accessories.includes(selectedValue)) {
                // Remove accessory
                userData[userId].accessories = userData[userId].accessories.filter(acc => acc !== selectedValue);
                saveUserData(userData);
                return interaction.reply({ 
                    content: `👑 Removed **${selectedValue}** from your panda!`, 
                    ephemeral: true 
                });
            } else {
                // Add accessory (max 3)
                if (userData[userId].accessories.length >= 3) {
                    return interaction.reply({ 
                        content: '🚫 You can only wear up to 3 accessories at once! Remove one first.', 
                        ephemeral: true 
                    });
                }

                userData[userId].accessories.push(selectedValue);
                saveUserData(userData);
                return interaction.reply({ 
                    content: `👑 Added **${selectedValue}** to your panda!`, 
                    ephemeral: true 
                });
            }
        }
    }

    if (roleCategories[customId]) {
        try {
            const selectedRoleId = values[0];
            const selectedRole = guild.roles.cache.get(selectedRoleId);

            if (!selectedRole) {
                return interaction.reply({ content: '❌ Role not found! Please contact an admin.', flags: 64 });
            }

            // Check if user already has this role
            const hasRole = member.roles.cache.has(selectedRoleId);

            if (hasRole) {
                // Remove the role
                await member.roles.remove(selectedRoleId);
                await interaction.reply({ 
                    content: `✅ Removed **${selectedRole.name}** role!`, 
                    ephemeral: true 
                });
            } else {
                // Remove other roles in this category first (mutual exclusion)
                const categoryRoles = roleCategories[customId];
                const currentRolesInCategory = member.roles.cache.filter(role => 
                    categoryRoles.includes(role.id)
                );

                if (currentRolesInCategory.size > 0) {
                    await member.roles.remove(currentRolesInCategory);
                }

                // Add the new role
                await member.roles.add(selectedRoleId);
                await interaction.reply({ 
                    content: `✅ Added **${selectedRole.name}** role!`, 
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.error('Role assignment error:', error);
            await interaction.reply({ 
                content: '❌ Failed to assign role! Make sure the bot has permission to manage roles and is above the role in hierarchy.', 
                ephemeral: true 
            });
        }
    }
});

// Handle button interactions for rock-paper-scissors
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    // Handle rock-paper-scissors button clicks
    if (customId.startsWith('rps_')) {
        const [action, choice, gameId] = customId.split('_');

        if (!activeGames.has(gameId)) {
            return interaction.reply({ 
                content: "This game has expired or doesn't exist anymore.", 
                ephemeral: true 
            });
        }

        const game = activeGames.get(gameId);
        const userId = interaction.user.id;

        // Check if this user is part of the game
        if (userId !== game.challenger.id && userId !== game.opponent.id) {
            return interaction.reply({ 
                content: "You're not part of this game!", 
                ephemeral: true 
            });
        }

        // Record the player's choice
        if (userId === game.challenger.id) {
            if (game.challengerChoice) {
                return interaction.reply({ 
                    content: "You already made your choice!", 
                    ephemeral: true 
                });
            }
            game.challengerChoice = choice;
        } else {
            if (game.opponentChoice) {
                return interaction.reply({ 
                    content: "You already made your choice!", 
                    ephemeral: true 
                });
            }
            game.opponentChoice = choice;
        }

        // Confirm choice privately
        await interaction.reply({ 
            content: `You chose **${choice}**! Waiting for the other player...`, 
            ephemeral: true 
        });

        // Check if both players have made their choices
        if (game.challengerChoice && game.opponentChoice) {
            // Remove the game from active games
            activeGames.delete(gameId);

            // Determine the winner
            const challengerChoice = game.challengerChoice;
            const opponentChoice = game.opponentChoice;

            let result;
            if (challengerChoice === opponentChoice) {
                result = "It's a tie. Both of you are equally mid.";
            } else if (
                (challengerChoice === 'rock' && opponentChoice === 'scissors') ||
                (challengerChoice === 'paper' && opponentChoice === 'rock') ||
                (challengerChoice === 'scissors' && opponentChoice === 'paper')
            ) {
                result = `${game.challenger} wins! ${game.opponent} has to go cry to Ella.`;
            } else {
                result = `${game.opponent} wins! ${game.challenger} has to move to the Eerie Forest.`;
            }

            // Get the channel and send results
            const channel = interaction.client.channels.cache.get(game.channelId);
            if (channel) {
                await channel.send(`🪨📄✂️ **Rock-Paper-Scissors Results:**\n${game.challenger} picked **${challengerChoice}**\n${game.opponent} picked **${opponentChoice}**\n\n${result}`);
            }
        }
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord with your bot's token
const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN || 'your_bot_token_here';

if (token === 'your_bot_token_here') {
    console.error('❌ Please set the DISCORD_TOKEN environment variable!');
    process.exit(1);
}

client.login(token);