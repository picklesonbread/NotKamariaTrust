const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('panda')
        .setDescription('manage your virtual panda profile')
        .addSubcommand(subcommand =>
            subcommand
                .setName('profile')
                .setDescription('view your panda profile')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('customize')
                .setDescription('customize your panda appearance with dropdown menus')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('view detailed panda statistics')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rename')
                .setDescription('rename your panda (costs 50 coins)')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('new name for your panda')
                        .setRequired(true)
                        .setMaxLength(50)
                )
        ),
    new SlashCommandBuilder()
        .setName('minigame')
        .setDescription('challenge another panda to Rock-Paper-Scissors.')
        .addUserOption(option =>
          option.setName('opponent')
            .setDescription('the user you want to challenge')
            .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('level')
        .setDescription('check your level progress and XP')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('check another user\'s level (optional)')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('levelroles')
        .setDescription('manage level-based role assignments (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('view all level-based roles')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('set a role for a specific level')
                .addIntegerOption(option =>
                    option
                        .setName('level')
                        .setDescription('the level required for this role')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(1000)
                )
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('the role to assign at this level')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('remove a level-based role assignment')
                .addIntegerOption(option =>
                    option
                        .setName('level')
                        .setDescription('the level to remove role assignment from')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(1000)
                )
        ),

    new SlashCommandBuilder()
        .setName('coins')
        .setDescription('economy and coin management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('balance')
                .setDescription('check your coin balance')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('earn')
                .setDescription('work to earn coins (30min cooldown)')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('give coins to another user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('user to give coins to')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('amount of coins to give')
                        .setRequired(true)
                        .setMinValue(1)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('gamble')
                .setDescription('gamble your coins for a chance to win more')
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('amount of coins to gamble')
                        .setRequired(true)
                        .setMinValue(10)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('view the richest pandas leaderboard')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('shop')
                .setDescription('view the panda shop')
        ),

    new SlashCommandBuilder()
        .setName('daily')
        .setDescription('daily rewards and streaks')
        .addSubcommand(subcommand =>
            subcommand
                .setName('claim')
                .setDescription('claim your daily reward')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('streak')
                .setDescription('check your daily streak status')
        ),

    new SlashCommandBuilder()
        .setName('help')
        .setDescription('get help with bot commands')
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('get help for a specific category')
                .addChoices(
                    { name: 'panda profile', value: 'panda' },
                    { name: 'economy', value: 'economy' },
                    { name: 'daily rewards', value: 'daily' },
                    { name: 'moderation', value: 'mod' }
                )
        ),

    new SlashCommandBuilder()
        .setName('mod')
        .setDescription('moderation commands (staff only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('coins')
                .setDescription('manage user coins')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('user to manage')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('action')
                        .setDescription('action to perform')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Add', value: 'add' },
                            { name: 'Remove', value: 'remove' },
                            { name: 'Set', value: 'set' }
                        )
                )
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('amount of coins')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('reset user data')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('user to reset')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('what to reset')
                        .setRequired(true)
                        .addChoices(
                            { name: 'profile', value: 'profile' },
                            { name: 'economy', value: 'economy' },
                            { name: 'all Data', value: 'all' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View server statistics')
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('Type of statistics')
                        .addChoices(
                            { name: 'general', value: 'general' },
                            { name: 'economy', value: 'economy' },
                            { name: 'users', value: 'users' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('announce')
                .setDescription('make a server announcement')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('announcement message')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('backup')
                .setDescription('create a database backup')
        ),

    new SlashCommandBuilder()
        .setName('prophecy')
        .setDescription('receive an unhinged prophecy from Kamaria!'),

    new SlashCommandBuilder()
        .setName('randomquest')
        .setDescription('receive a totally fake, useless Panfu quest'),

    new SlashCommandBuilder()
        .setName('volcano')
        .setDescription('sacrifice someone to the volcano')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('the user to sacrifice to the volcano')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('pandaname')
        .setDescription('generates a cursed Panfu-style username'),

    new SlashCommandBuilder()
        .setName('shop')
        .setDescription('view or buy cursed Panfu items')
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('view all available shop items')
        )
        .addSubcommand(sub =>
            sub.setName('buy')
                .setDescription('purchase an item from the shop')
                .addStringOption(opt =>
                    opt.setName('item')
                        .setDescription('name of the item to buy')
                        .setRequired(true)
                )
        ),

    new SlashCommandBuilder()
        .setName('treasurehunt')
        .setDescription('start a Panfu treasure hunt for everyone in the channel!'),

    new SlashCommandBuilder()
        .setName('volcanoescape')
        .setDescription('test your reflexes and escape the erupting Panfu volcano!'),

    new SlashCommandBuilder()
        .setName('bananabet')
        .setDescription('challenge another panda to a coin flip bet!')
        .addUserOption(opt =>
            opt.setName('opponent')
                .setDescription('the panda you want to challenge')
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName('amount')
                .setDescription('number of coins to wager')
                .setRequired(true)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName('fish')
        .setDescription('cast your fishing rod at various Panfu locations!')
        .addStringOption(opt =>
            opt.setName('location')
                .setDescription('where do you want to fish?')
                .setRequired(true)
                .addChoices(
                    { name: '🏖️ Panfu Beach', value: 'beach' },
                    { name: '🌿 Swamp of Sadness', value: 'swamp' },
                    { name: '🌋 Volcano Lake', value: 'volcano' },
                    { name: '🌸 Cherry Blossom Pond', value: 'pond' }
                )
        ),

    new SlashCommandBuilder()
        .setName('explore')
        .setDescription('explore various locations across Panfu island!')
        .addStringOption(opt =>
            opt.setName('location')
                .setDescription('where do you want to explore?')
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

    new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('test your Panfu knowledge and general trivia!')
        .addStringOption(opt =>
            opt.setName('category')
                .setDescription('choose a category (optional)')
                .addChoices(
                    { name: '🐼 All Questions', value: 'all' },
                    { name: '📚 Panfu History', value: 'history' },
                    { name: '👥 Panfu Characters', value: 'characters' },
                    { name: '🗺️ Panfu Locations', value: 'locations' },
                    { name: '🎮 Panfu Gameplay', value: 'gameplay' },
                    { name: '🌍 General Knowledge', value: 'general' }
                )
        ),

    new SlashCommandBuilder()
        .setName('achievements')
        .setDescription('view and track your achievement progress!')
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('view all your achievements')
        )
        .addSubcommand(sub =>
            sub.setName('category')
                .setDescription('view achievements by category')
                .addStringOption(opt =>
                    opt.setName('category')
                        .setDescription('achievement category')
                        .setRequired(true)
                        .addChoices(
                            { name: '🎣 Fishing Master', value: 'fishing' },
                            { name: '🗺️ Island Explorer', value: 'exploration' },
                            { name: '🧠 Knowledge Keeper', value: 'trivia' },
                            { name: '💰 Wealth Accumulator', value: 'economy' },
                            { name: '👥 Social Butterfly', value: 'social' },
                            { name: '⚔️ Quest Champion', value: 'quests' },
                            { name: '⭐ Level Progression', value: 'levels' },
                            { name: '🌟 Special Badges', value: 'special' }
                        )
                )
        )
        .addSubcommand(sub =>
            sub.setName('progress')
                .setDescription('view your current progress on achievements')
        ),

    new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('view your complete collection of fish, items, stamps, and artifacts!')
        .addSubcommand(sub =>
            sub.setName('all')
                .setDescription('view your entire inventory')
        )
        .addSubcommand(sub =>
            sub.setName('fish')
                .setDescription('view all fish you\'ve caught')
        )
        .addSubcommand(sub =>
            sub.setName('items')
                .setDescription('view all items you own')
        )
        .addSubcommand(sub =>
            sub.setName('stamps')
                .setDescription('view your stamp collection')
        )
        .addSubcommand(sub =>
            sub.setName('artifacts')
                .setDescription('view your time travel artifacts')
        ),

    new SlashCommandBuilder()
        .setName('mystery')
        .setDescription('solve mysterious cases happening around Panfu island')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('start investigating a new mystery')
        )
        .addSubcommand(sub =>
            sub.setName('clue')
                .setDescription('get a clue for the current mystery')
        )
        .addSubcommand(sub =>
            sub.setName('solve')
                .setDescription('attempt to solve the mystery')
                .addStringOption(opt =>
                    opt.setName('suspect')
                        .setDescription('who do you think is responsible?')
                        .setRequired(true)
                )
        ),

    new SlashCommandBuilder()
        .setName('quest')
        .setDescription('embark on epic multi-step adventures across Panfu island')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('begin a new quest adventure')
        )
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('check your current quest progress')
        )
        .addSubcommand(sub =>
            sub.setName('continue')
                .setDescription('continue to the next step of your quest')
        )
        .addSubcommand(sub =>
            sub.setName('abandon')
                .setDescription('abandon your current quest')
        ),

    new SlashCommandBuilder()
        .setName('blackmarket')
        .setDescription('visit Gonzo\'s sketchy underground trading post')
        .addSubcommand(sub =>
            sub.setName('browse')
                .setDescription('see what suspicious items Gonzo has for sale')
        )
        .addSubcommand(sub =>
            sub.setName('buy')
                .setDescription('purchase a sketchy item from Gonzo')
                .addStringOption(opt =>
                    opt.setName('item')
                        .setDescription('name of the item to buy')
                        .setRequired(true)
                )
        ),

    new SlashCommandBuilder()
        .setName('weatherreport')
        .setDescription('get the latest dramatic weather report from across Panfu island')
        .addStringOption(opt =>
            opt.setName('location')
                .setDescription('specific location to check (optional)')
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

    new SlashCommandBuilder()
        .setName('timetravel')
        .setDescription('travel through different eras of Panfu history')
        .addStringOption(opt =>
            opt.setName('era')
                .setDescription('which era do you want to visit?')
                .addChoices(
                    { name: 'Golden Age (2007-2009)', value: 'golden' },
                    { name: 'Drama Era (2010-2012)', value: 'drama' },
                    { name: 'Apocalypse (2013-2016)', value: 'apocalypse' },
                    { name: 'Wasteland (2017-2020)', value: 'wasteland' },
                    { name: 'Renaissance (2021-Present)', value: 'renaissance' },
                    { name: 'Random Era', value: 'random' }
                )
        ),

    new SlashCommandBuilder()
        .setName('stamps')
        .setDescription('collect and trade rare Panfu stamps')
        .addSubcommand(sub =>
            sub.setName('collection')
                .setDescription('view your stamp collection')
        )
        .addSubcommand(sub =>
            sub.setName('find')
                .setDescription('search for a new stamp (costs 5 coins)')
        )
        .addSubcommand(sub =>
            sub.setName('trade')
                .setDescription('trade stamps with another panda')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('panda to trade with')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('offer')
                        .setDescription('stamp you want to trade')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('request')
                        .setDescription('stamp you want in return')
                        .setRequired(true)
                )
        ),

    new SlashCommandBuilder()
        .setName('pets')
        .setDescription('adopt and care for virtual Panfu pets')
        .addSubcommand(sub =>
            sub.setName('adopt')
                .setDescription('adopt a new pet (costs 20 coins)')
        )
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('check your pet\'s current status')
        )
        .addSubcommand(sub =>
            sub.setName('feed')
                .setDescription('feed your pet (costs 3 coins)')
        )
        .addSubcommand(sub =>
            sub.setName('play')
                .setDescription('play with your pet (costs 2 coins)')
        )
        .addSubcommand(sub =>
            sub.setName('sleep')
                .setDescription('let your pet sleep (costs 1 coin)')
        )
        .addSubcommand(sub =>
            sub.setName('train')
                .setDescription('train your pet (costs 5 coins)')
        ),

    new SlashCommandBuilder()
        .setName('conspiracy')
        .setDescription('uncover wild conspiracy theories about Panfu island'),

    new SlashCommandBuilder()
    .setName('friendship')
    .setDescription('build and manage friendships with other pandas')
    .addSubcommand(sub =>
        sub.setName('check')
            .setDescription('check friendship level with another panda')
            .addUserOption(opt =>
                opt.setName('user')
                    .setDescription('panda to check friendship with')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub.setName('hangout')
            .setDescription('hang out with a friend (free)')
            .addUserOption(opt =>
                opt.setName('user')
                    .setDescription('friend to hang out with')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub.setName('gift')
            .setDescription('give a gift to strengthen friendship (costs 5 coins)')
            .addUserOption(opt =>
                opt.setName('user')
                    .setDescription('friend to give gift to')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub.setName('adventure')
            .setDescription('go on an adventure together (costs 8 coins)')
            .addUserOption(opt =>
                opt.setName('user')
                    .setDescription('friend to adventure with')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub.setName('leaderboard')
            .setDescription('view your top friendships')
    ),

    new SlashCommandBuilder()
        .setName('rolesetup')
        .setDescription('Post the full self-assign role menu'),

    new SlashCommandBuilder()
        .setName('trial')
        .setDescription('Put another user on trial and deliver a savage verdict')
        .addUserOption(option =>
            option.setName('defendant')
                .setDescription('The user to put on trial')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('expose')
        .setDescription('Expose another user\'s dirty secrets and embarrassing browser history')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to expose')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('recipes')
        .setDescription('View delicious baking recipes!')
        .addStringOption(option =>
            option.setName('recipe')
                .setDescription('Choose a recipe')
                .setRequired(true)
                .addChoices(
                    { name: '🍎 Apple and Caramel Rolls', value: 'apple-caramel-rolls' },
                    { name: '🥖 Chałka (Sweet Braided Bread)', value: 'chalka' },
                    { name: '⭐ Cheese Star', value: 'cheese-star' },
                    { name: '🫐 Cheesecake with Blueberries', value: 'cheesecake-blueberry' },
                    { name: '🥐 Cinnamon Rolls', value: 'cinnamon-rolls' },
                    { name: '🍑 Peach Cheesecake', value: 'peach-cheesecake' },
                    { name: '🍓 Strawberries and Cream Cake', value: 'strawberry-cream-cake' }
                )
        )
];

async function deployCommands() {
    const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
    const rest = new REST().setToken(token);

    try {
        console.log('🔄 Started refreshing application (/) commands.');

        // Register commands globally (will take up to 1 hour to appear everywhere)
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(command => command.toJSON()) }
        );

        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
}

// Only deploy if this file is run directly
if (require.main === module) {
    const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
    if (!token) {
        console.error('❌ DISCORD_TOKEN environment variable is required!');
        process.exit(1);
    }

    if (!process.env.CLIENT_ID) {
        console.error('❌ CLIENT_ID environment variable is required!');
        console.error('ℹ️  You can find your bot\'s Client ID in the Discord Developer Portal under the "General Information" section.');
        process.exit(1);
    }

    deployCommands();
}

module.exports = { commands, deployCommands };