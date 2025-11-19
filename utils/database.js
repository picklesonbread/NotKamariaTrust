const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure Neon for serverless environment
if (typeof window === 'undefined') {
    neonConfig.webSocketConstructor = ws;
}

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, falling back to JSON storage');
    module.exports = null;
} else {
    // Create database connection pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    /**
     * Initialize database tables
     */
    async function initializeDatabase() {
        try {
            // Create users table with leveling system
            await pool.query(`
                CREATE TABLE IF NOT EXISTS discord_users (
                    user_id TEXT PRIMARY KEY,
                    username TEXT NOT NULL,
                    panda_name TEXT NOT NULL,
                    color TEXT DEFAULT 'classic',
                    accessories TEXT[] DEFAULT '{}',
                    coins INTEGER DEFAULT 100,
                    level INTEGER DEFAULT 1,
                    experience INTEGER DEFAULT 0,
                    total_messages INTEGER DEFAULT 0,
                    last_message_time TIMESTAMP,
                    stats JSONB DEFAULT '{"friendship": 50, "energy": 100, "happiness": 75, "bamboo_eaten": 0, "games_played": 0, "days_active": 1}'::jsonb,
                    last_daily TIMESTAMP,
                    daily_streak INTEGER DEFAULT 0,
                    last_work TIMESTAMP,
                    active_quest JSONB DEFAULT NULL,
                    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create guilds table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS discord_guilds (
                    guild_id TEXT PRIMARY KEY,
                    prefix TEXT DEFAULT '!',
                    daily_reward_channel TEXT,
                    economy_enabled BOOLEAN DEFAULT true,
                    moderation_enabled BOOLEAN DEFAULT true,
                    welcome_message TEXT DEFAULT 'Welcome to the Panfu community! 🐼',
                    leveling_enabled BOOLEAN DEFAULT true,
                    level_up_channel TEXT,
                    settings JSONB DEFAULT '{"maxDailyReward": 200, "baseWorkReward": 50, "gamblingEnabled": true, "transfersEnabled": true, "xpPerMessage": 15, "xpCooldown": 60}'::jsonb,
                    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create level roles table for tracking role progression
            await pool.query(`
                CREATE TABLE IF NOT EXISTS level_roles (
                    guild_id TEXT NOT NULL,
                    level INTEGER NOT NULL,
                    role_id TEXT NOT NULL,
                    role_name TEXT NOT NULL,
                    PRIMARY KEY (guild_id, level)
                )
            `);

            // Add active_quest column if it doesn't exist (migration)
            await pool.query(`
                ALTER TABLE discord_users 
                ADD COLUMN IF NOT EXISTS active_quest JSONB DEFAULT NULL
            `);

            // Add achievements column if it doesn't exist (migration)
            await pool.query(`
                ALTER TABLE discord_users 
                ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '{}'::jsonb
            `);

            // Add stats tracking column if it doesn't exist (migration)
            await pool.query(`
                ALTER TABLE discord_users 
                ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"fish_caught": 0, "explorations": 0, "trivia_correct": 0, "quests_completed": 0, "volcano_escapes": 0, "banana_wins": 0, "mysteries_solved": 0, "locations_visited": []}'::jsonb
            `);

            // Add inventory column if it doesn't exist (migration)
            await pool.query(`
                ALTER TABLE discord_users 
                ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '{}'::jsonb
            `);

            // Add fish_caught column if it doesn't exist (migration)
            await pool.query(`
                ALTER TABLE discord_users 
                ADD COLUMN IF NOT EXISTS fish_caught JSONB DEFAULT '{}'::jsonb
            `);

            console.log('✅ Database tables initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Error initializing database:', error);
            return false;
        }
    }

    /**
     * Get user profile from database or create new one
     */
    async function getUserProfile(userId, username) {
        try {
            // Try to get existing user
            const result = await pool.query(
                'SELECT * FROM discord_users WHERE user_id = $1',
                [userId]
            );

            if (result.rows.length > 0) {
                return result.rows[0];
            }

            // Create new user if doesn't exist
            const newUser = await pool.query(`
                INSERT INTO discord_users (
                    user_id, username, panda_name, color, accessories, coins, 
                    level, experience, total_messages, stats, daily_streak
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `, [
                userId,
                username,
                username + "'s Panda",
                'classic',
                [],
                100,
                1,
                0,
                0,
                { friendship: 50, energy: 100, happiness: 75, bamboo_eaten: 0, games_played: 0, days_active: 1 },
                0
            ]);

            return newUser.rows[0];
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    /**
     * Update user profile in database
     */
    async function updateUserProfile(userId, updates) {
        try {
            const setClause = Object.keys(updates)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(', ');

            const values = [userId, ...Object.values(updates)];

            await pool.query(
                `UPDATE discord_users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
                values
            );

            return true;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return false;
        }
    }

    /**
     * Add XP to user and check for level up - ATOMIC OPERATION
     */
    async function addUserXP(userId, xpAmount, guildId) {
        try {
            // Atomic update that adds XP and calculates level in a single operation
            // This prevents race conditions when multiple messages are processed simultaneously
            const result = await pool.query(`
                UPDATE discord_users 
                SET 
                    experience = experience + $2,
                    level = FLOOR(SQRT((experience + $2) / 100)) + 1,
                    total_messages = total_messages + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1
                RETURNING 
                    level as new_level,
                    experience as new_experience,
                    FLOOR(SQRT((experience - $2) / 100)) + 1 as old_level,
                    (experience - $2) as old_experience
            `, [userId, xpAmount]);

            if (result.rows.length === 0) {
                // User doesn't exist, return default values
                return { leveledUp: false, newLevel: 1, xpGained: 0, totalXP: 0 };
            }

            const row = result.rows[0];
            const newLevel = row.new_level;
            const oldLevel = row.old_level;
            const leveledUp = newLevel > oldLevel;

            return {
                leveledUp,
                newLevel,
                oldLevel,
                xpGained: xpAmount,
                totalXP: row.new_experience
            };
        } catch (error) {
            console.error('Error adding user XP:', error);
            return { leveledUp: false, newLevel: 1, xpGained: 0 };
        }
    }

    /**
     * Calculate level from total XP
     * Formula: Level = sqrt(XP / 100) + 1
     */
    function calculateLevelFromXP(totalXP) {
        return Math.floor(Math.sqrt(totalXP / 100)) + 1;
    }

    /**
     * Calculate XP needed for specific level
     * Formula: XP = (Level - 1)^2 * 100
     */
    function calculateXPForLevel(level) {
        return Math.pow(level - 1, 2) * 100;
    }

    /**
     * Get XP needed for next level
     */
    function getXPForNextLevel(currentLevel, currentXP) {
        const nextLevelXP = calculateXPForLevel(currentLevel + 1);
        return nextLevelXP - currentXP;
    }

    /**
     * Get guild settings
     */
    async function getGuildSettings(guildId) {
        try {
            const result = await pool.query(
                'SELECT * FROM discord_guilds WHERE guild_id = $1',
                [guildId]
            );

            if (result.rows.length > 0) {
                return result.rows[0];
            }

            // Create new guild settings
            const newGuild = await pool.query(`
                INSERT INTO discord_guilds (guild_id, settings)
                VALUES ($1, $2)
                RETURNING *
            `, [
                guildId,
                { maxDailyReward: 200, baseWorkReward: 50, gamblingEnabled: true, transfersEnabled: true, xpPerMessage: 15, xpCooldown: 60 }
            ]);

            return newGuild.rows[0];
        } catch (error) {
            console.error('Error getting guild settings:', error);
            return null;
        }
    }

    /**
     * Set level role for guild
     */
    async function setLevelRole(guildId, level, roleId, roleName) {
        try {
            await pool.query(`
                INSERT INTO level_roles (guild_id, level, role_id, role_name)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (guild_id, level) 
                DO UPDATE SET role_id = $3, role_name = $4
            `, [guildId, level, roleId, roleName]);
            return true;
        } catch (error) {
            console.error('Error setting level role:', error);
            return false;
        }
    }

    /**
     * Get level roles for guild
     */
    async function getLevelRoles(guildId) {
        try {
            const result = await pool.query(
                'SELECT * FROM level_roles WHERE guild_id = $1 ORDER BY level',
                [guildId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting level roles:', error);
            return [];
        }
    }

    /**
     * Update user coins (add or subtract)
     */
    async function updateUserCoins(userId, coinChange) {
        try {
            await pool.query(
                'UPDATE discord_users SET coins = coins + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
                [coinChange, userId]
            );
            return true;
        } catch (error) {
            console.error('Error updating user coins:', error);
            return false;
        }
    }

    /**
     * Update user stats
     */
    async function updateUserStats(userId, stats) {
        try {
            // Update each stat key in the JSONB stats column
            for (const [key, value] of Object.entries(stats)) {
                await pool.query(
                    `UPDATE discord_users SET stats = jsonb_set(stats, $1, $2) WHERE user_id = $3`,
                    [`{${key}}`, JSON.stringify(value), userId]
                );
            }
            return true;
        } catch (error) {
            console.error('Error updating user stats:', error);
            return false;
        }
    }

    /**
     * Get leaderboard by coins
     */
    async function getLeaderboard(limit = 10) {
        try {
            const result = await pool.query(
                'SELECT user_id, username, coins, level, experience FROM discord_users ORDER BY coins DESC LIMIT $1',
                [limit]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    }

    module.exports = {
        pool,
        initializeDatabase,
        getUserProfile,
        updateUserProfile,
        addUserXP,
        calculateLevelFromXP,
        calculateXPForLevel,
        getXPForNextLevel,
        getGuildSettings,
        setLevelRole,
        getLevelRoles,
        updateUserCoins,
        updateUserStats,
        getLeaderboard,
        isInitialized: () => pool !== null
    };
}