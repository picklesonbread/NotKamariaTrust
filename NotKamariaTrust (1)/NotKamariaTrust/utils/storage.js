const fs = require('fs');
const path = require('path');

// Data file paths
const USER_DATA_PATH = path.join(__dirname, '../data/users.json');
const GUILD_DATA_PATH = path.join(__dirname, '../data/guilds.json');

/**
 * Load user data from file
 * @returns {Object} User data object
 */
function loadUserData() {
    try {
        if (!fs.existsSync(USER_DATA_PATH)) {
            // Create empty data file if it doesn't exist
            saveUserData({});
            return {};
        }

        const data = fs.readFileSync(USER_DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading user data:', error);
        return {};
    }
}

/**
 * Save user data to file
 * @param {Object} userData - User data object to save
 */
function saveUserData(userData) {
    try {
        // Ensure data directory exists
        const dataDir = path.dirname(USER_DATA_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Write data with pretty formatting
        fs.writeFileSync(USER_DATA_PATH, JSON.stringify(userData, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

/**
 * Load guild data from file
 * @returns {Object} Guild data object
 */
function loadGuildData() {
    try {
        if (!fs.existsSync(GUILD_DATA_PATH)) {
            // Create empty data file if it doesn't exist
            saveGuildData({});
            return {};
        }

        const data = fs.readFileSync(GUILD_DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading guild data:', error);
        return {};
    }
}

/**
 * Save guild data to file
 * @param {Object} guildData - Guild data object to save
 */
function saveGuildData(guildData) {
    try {
        // Ensure data directory exists
        const dataDir = path.dirname(GUILD_DATA_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Write data with pretty formatting
        fs.writeFileSync(GUILD_DATA_PATH, JSON.stringify(guildData, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving guild data:', error);
    }
}

/**
 * Get user profile or create new one
 * @param {string} userId - Discord user ID
 * @param {string} username - Discord username
 * @returns {Object} User profile object
 */
function getUserProfile(userId, username) {
    const userData = loadUserData();

    if (!userData[userId]) {
        // Create new user profile
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
            lastDaily: null,
            dailyStreak: 0,
            lastWork: null,
            joinDate: new Date().toISOString()
        };

        saveUserData(userData);
    }

    return userData[userId];
}

/**
 * Update user profile
 * @param {string} userId - Discord user ID
 * @param {Object} updates - Object with properties to update
 */
function updateUserProfile(userId, updates) {
    const userData = loadUserData();

    if (userData[userId]) {
        // Merge updates into existing profile
        userData[userId] = { ...userData[userId], ...updates };
        saveUserData(userData);
    }
}

/**
 * Get guild settings or create new ones
 * @param {string} guildId - Discord guild ID
 * @returns {Object} Guild settings object
 */
function getGuildSettings(guildId) {
    const guildData = loadGuildData();

    if (!guildData[guildId]) {
        // Create new guild settings
        guildData[guildId] = {
            prefix: '!',
            dailyRewardChannel: null,
            economyEnabled: true,
            moderationEnabled: true,
            welcomeMessage: 'Welcome to the Panfu community! 🐼',
            settings: {
                maxDailyReward: 200,
                baseWorkReward: 50,
                gamblingEnabled: true,
                transfersEnabled: true
            },
            joinDate: new Date().toISOString()
        };

        saveGuildData(guildData);
    }

    return guildData[guildId];
}

/**
 * Update guild settings
 * @param {string} guildId - Discord guild ID
 * @param {Object} updates - Object with properties to update
 */
function updateGuildSettings(guildId, updates) {
    const guildData = loadGuildData();

    if (guildData[guildId]) {
        // Merge updates into existing settings
        guildData[guildId] = { ...guildData[guildId], ...updates };
        saveGuildData(guildData);
    }
}

/**
 * Backup all data
 * @returns {Object} Complete backup object
 */
function createBackup() {
    const userData = loadUserData();
    const guildData = loadGuildData();

    return {
        timestamp: new Date().toISOString(),
        version: '1.0',
        users: userData,
        guilds: guildData,
        stats: {
            totalUsers: Object.keys(userData).length,
            totalGuilds: Object.keys(guildData).length
        }
    };
}

/**
 * Restore data from backup
 * @param {Object} backupData - Backup object to restore
 * @returns {boolean} Success status
 */
function restoreFromBackup(backupData) {
    try {
        if (backupData.users) {
            saveUserData(backupData.users);
        }

        if (backupData.guilds) {
            saveGuildData(backupData.guilds);
        }

        return true;
    } catch (error) {
        console.error('Error restoring from backup:', error);
        return false;
    }
}

module.exports = {
    loadUserData,
    saveUserData,
    loadGuildData,
    saveGuildData,
    getUserProfile,
    updateUserProfile,
    getGuildSettings,
    updateGuildSettings,
    createBackup,
    restoreFromBackup
};
