/**
 * Constants for the Panfu Discord Bot
 * Contains all the static data and configuration values
 */

// Panda color options with their hex color codes
const PANDA_COLORS = {
    classic: '#000000',    // Black and white classic panda
    brown: '#61412a',      // Brown panda variant
    white: '#FFFFFF',      // Albino white panda
    black: '#0d0c0c',      // Dark black panda
    red: '#de4343',        // Red panda inspired
    yellow: '#e0d775', 
    blue: '#63bdeb',       // Blue-tinted panda
    darkblue: '#112945',
    green: '#7bc992',      // Green bamboo-colored panda
    darkgreen: '#385925',
    pink: '#FFB6C1',       // Pink cherry blossom panda
    purple: '#DDA0DD',     // Purple mystical panda
    magenta: '#592542',
    orange: '#e3ae4d'      // Orange sunset panda
};

// Available accessories for pandas
const PANDA_ACCESSORIES = [
    'hat',          // Classic panda hat
    'glasses',      // Cute reading glasses
    'bow',          // Colorful bow tie
    'scarf',        // Warm winter scarf
    'necklace',     // Shiny bamboo necklace
    'earrings',     // Sparkling earrings
    'crown',        // Royal golden crown
    'mask',         // Mysterious face mask
    'bowtie',       // Elegant bow tie
    'headband'      // Stylish headband
];

// Base stats for new pandas
const PANDA_STATS = {
    happiness: 75,
    energy: 100,
    friendship: 50,
    bamboo_eaten: 0,
    games_played: 0,
    days_active: 1
};

// Experience points required for each level
const LEVEL_REQUIREMENTS = {
    1: 0,
    2: 100,
    3: 250,
    4: 450,
    5: 700,
    6: 1000,
    7: 1350,
    8: 1750,
    9: 2200,
    10: 2700
};

// Daily reward amounts based on streak
const DAILY_REWARDS = {
    base_coins: 50,
    base_experience: 10,
    streak_multiplier: 5,
    max_streak_bonus: 100,
    milestones: {
        7: 100,    // Weekly bonus
        30: 500,   // Monthly bonus
        100: 2000, // Long-term bonus
        365: 10000 // Yearly bonus
    }
};

// Work activity rewards
const WORK_ACTIVITIES = [
    {
        name: 'collected bamboo in the forest',
        min_coins: 15,
        max_coins: 35,
        experience: 5,
        happiness: 2
    },
    {
        name: 'played with other pandas',
        min_coins: 10,
        max_coins: 25,
        experience: 3,
        happiness: 5
    },
    {
        name: 'cleaned the treehouse',
        min_coins: 20,
        max_coins: 40,
        experience: 7,
        happiness: 1
    },
    {
        name: 'helped at the Panfu café',
        min_coins: 12,
        max_coins: 30,
        experience: 4,
        happiness: 3
    },
    {
        name: 'taught younger pandas',
        min_coins: 18,
        max_coins: 38,
        experience: 8,
        happiness: 4
    },
    {
        name: 'organized a panda party',
        min_coins: 25,
        max_coins: 45,
        experience: 6,
        happiness: 6
    },
    {
        name: 'explored new bamboo groves',
        min_coins: 14,
        max_coins: 32,
        experience: 5,
        happiness: 3
    },
    {
        name: 'completed daily exercises',
        min_coins: 16,
        max_coins: 28,
        experience: 4,
        happiness: 2
    }
];

// Shop items and their costs
const SHOP_ITEMS = {
    'bamboo_snack': {
        name: 'Bamboo Snack',
        cost: 25,
        description: '+10 Happiness, +5 Energy',
        emoji: '🎋',
        effects: { happiness: 10, energy: 5 }
    },
    'energy_drink': {
        name: 'Energy Drink',
        cost: 75,
        description: 'Full energy restore',
        emoji: '⚡',
        effects: { energy: 100 }
    },
    'friendship_boost': {
        name: 'Friendship Boost',
        cost: 150,
        description: '+20 Friendship points',
        emoji: '🤝',
        effects: { friendship: 20 }
    },
    'mystery_box': {
        name: 'Mystery Box',
        cost: 100,
        description: 'Random reward!',
        emoji: '🎁',
        effects: 'random'
    },
    'premium_accessory': {
        name: 'Premium Accessory',
        cost: 200,
        description: 'Exclusive accessory unlock',
        emoji: '👑',
        effects: 'accessory'
    },
    'panda_rename': {
        name: 'Panda Rename',
        cost: 50,
        description: 'Change your panda\'s name',
        emoji: '✏️',
        effects: 'rename'
    }
};

// Gambling odds and payouts
const GAMBLING = {
    odds: {
        win: 0.4,    // 40% chance to win
        tie: 0.3,    // 30% chance to break even
        lose: 0.3    // 30% chance to lose
    },
    payouts: {
        win: 1.5,    // 1.5x return
        tie: 1.0,    // Money back
        lose: 0.0    // Lose everything
    },
    min_bet: 10,
    max_bet: 1000
};

// Fun panda messages and responses
const PANDA_MESSAGES = {
    greetings: [
        "🐼 Welcome to the bamboo forest!",
        "🎋 A wild panda appears!",
        "🐾 *bamboo rustling sounds*",
        "🌿 The pandas are happy to see you!",
        "🎋 Time for some bamboo adventures!"
    ],
    work_complete: [
        "Great job! The pandas are proud of you! 🐼",
        "You worked hard! Here's your reward! 🎋",
        "The bamboo forest thanks you for your help! 🌿",
        "Outstanding work, panda friend! 🐾",
        "You've earned your bamboo! Well done! 🎯"
    ],
    level_up: [
        "🎉 Amazing! Your panda has grown stronger!",
        "⭐ Level up! Your panda's skills are improving!",
        "🚀 Incredible progress! Keep it up!",
        "🎊 Your dedication has paid off!",
        "💫 Your panda is becoming legendary!"
    ],
    daily_claim: [
        "🌅 Rise and shine, panda! Here's your daily reward!",
        "☀️ Good morning! The bamboo gods bless you today!",
        "🎋 Daily bamboo delivery! Fresh from the forest!",
        "🌸 A beautiful day for panda adventures!",
        "🎁 Your daily gift from the panda community!"
    ],
    gambling_win: [
        "🎉 The bamboo spirits smile upon you!",
        "🍀 Lucky panda! You've struck bamboo gold!",
        "⭐ Fortune favors the brave panda!",
        "🎊 Incredible luck! The forest celebrates!",
        "💫 You're on fire! What amazing fortune!"
    ],
    gambling_lose: [
        "😔 The bamboo spirits are mysterious today...",
        "🍃 Sometimes the wind doesn't blow our way...",
        "🌙 Tomorrow will bring better luck, brave panda!",
        "💭 Even great pandas have off days!",
        "🌱 This is just practice for your next big win!"
    ]
};

// Error messages
const ERROR_MESSAGES = {
    no_permissions: "🚫 You don't have permission to use this command!",
    invalid_user: "🚫 Please mention a valid user!",
    insufficient_coins: "🚫 You don't have enough coins for this action!",
    cooldown_active: "🕐 Please wait before using this command again!",
    invalid_amount: "🚫 Please specify a valid amount!",
    command_not_found: "🐼 Unknown command! Use `!panfu help` to see all available commands.",
    database_error: "🚫 Database error! Please try again later.",
    bot_error: "🚫 Something went wrong! Please contact a moderator if this persists."
};

// Success messages
const SUCCESS_MESSAGES = {
    profile_updated: "✅ Your panda profile has been updated!",
    coins_transferred: "💝 Coins transferred successfully!",
    daily_claimed: "🌅 Daily reward claimed successfully!",
    work_completed: "💼 Work completed! You've earned your reward!",
    purchase_successful: "🛒 Purchase successful! Enjoy your new item!",
    backup_created: "💾 Backup created successfully!",
    settings_updated: "⚙️ Settings updated successfully!"
};

// Cooldown times (in milliseconds)
const COOLDOWNS = {
    work: 30 * 60 * 1000,      // 30 minutes
    daily: 24 * 60 * 60 * 1000, // 24 hours
    gamble: 5 * 60 * 1000,      // 5 minutes
    transfer: 60 * 1000         // 1 minute
};

// Bot configuration
const BOT_CONFIG = {
    default_prefix: '!',
    max_accessories: 3,
    max_panda_name_length: 50,
    max_coins_transfer: 10000,
    default_starting_coins: 100,
    version: '1.0.0',
    author: 'Panfu Community Team'
};

module.exports = {
    PANDA_COLORS,
    PANDA_ACCESSORIES,
    PANDA_STATS,
    LEVEL_REQUIREMENTS,
    DAILY_REWARDS,
    WORK_ACTIVITIES,
    SHOP_ITEMS,
    GAMBLING,
    PANDA_MESSAGES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    COOLDOWNS,
    BOT_CONFIG
};
