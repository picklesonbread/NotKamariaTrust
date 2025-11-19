# Overview

This is a Discord bot themed around Panfu, a nostalgic virtual world game. The bot provides virtual panda profiles, an economy system with coins, mini-games, quests, and various interactive features. Users can customize their pandas, participate in challenges, collect items, and engage with other server members through themed commands.

The bot includes humorous, sarcastic personality elements with references to Panfu locations (Volcano, Disco Dome, Swamp of Sadness, etc.) and characters (Kamaria, Bonez, Max, Ella, Eloise, Gonzo).

# Recent Changes

## October 20, 2025 - Recipes Command Added
- **NEW**: Added /recipes command - share your baking creations!
  - 7 delicious recipes in alphabetical order: Apple & Caramel Rolls, Chałka, Cheese Star, Cheesecake with Blueberries, Cinnamon Rolls, Peach Cheesecake, Strawberries & Cream Cake
  - Each recipe includes: full ingredient list with measurements, step-by-step instructions, serving size, and beautiful stock photo
  - Organized dropdown menu with emoji icons for easy selection
  - Perfect for sharing recipes when server members ask about your baking!
  - Images stored in attached_assets/stock_images (can be replaced with personal photos)

## October 20, 2025 - Inventory System Added
- **NEW**: Added /inventory command - view all your collections in one place!
  - 5 subcommands: /inventory all (overview), /inventory fish (fish collection), /inventory items (shop/blackmarket items), /inventory stamps (stamp collection), /inventory artifacts (time travel items)
  - Displays unique species/items and total counts
  - Shows top 25 items per category sorted by quantity
  - Integrated with all existing collection systems: fishing, shop, blackmarket, stamps, timetravel
  - Helpful prompts when collections are empty directing users to relevant commands
  - Beautiful embeds with category-specific colors and icons
- **UX**: Removed non-functional "Bamboo Eaten" stat from coin balance and panda stats displays

## October 20, 2025 - Achievement System Added & Critical Fixes
- **CRITICAL FIX**: Fixed database table name bug that prevented coin updates
  - Root cause: Multiple queries using incorrect table name `users` instead of `discord_users`
  - Fixed in: database.js (updateUserCoins, updateUserStats, getLeaderboard), achievements.js, fish.js, explore.js, trivia.js, panda.js
  - Coins, stats, and achievements now properly save to database
- **CRITICAL FIX**: Fixed interaction reply order bug that triggered JSON fallback
  - Root cause: Achievement notifications (followUp) sent before main command reply, causing error
  - Fixed in: fish.js, explore.js, trivia.js - now send main reply first, then achievement notifications
  - Prevents stale JSON data from overwriting correct database values
- **CRITICAL FIX**: Fixed trivia command not detecting user responses
  - Root cause: awaitMessages() unreliable in Discord.js v14 with slash commands
  - Fixed in: trivia.js - switched from text input to button-based responses
  - Users now click buttons instead of typing numbers - much more reliable and better UX
- **NEW**: Added /achievements command - comprehensive badge collection system!
  - 8 achievement categories: Fishing Master, Island Explorer, Knowledge Keeper, Wealth Accumulator, Social Butterfly, Quest Champion, Level Progression, Special Badges
  - 35+ unique achievements with tiered progression (e.g., catch 1/10/50/100 fish)
  - Real-time progress tracking for all activities (fish caught, explorations, trivia correct, quests completed, etc.)
  - Coin and XP rewards for unlocking achievements (10-5000 coins, 0-2500 XP per achievement)
  - Automatic achievement notifications when unlocked during gameplay
  - Achievement display on user profiles showing top 3 most recent unlocked badges
  - Fully integrated with existing commands: /fish, /explore, /trivia automatically track progress
  - Database schema: Added `achievements` JSONB column and `stats` JSONB column for tracking progress
  - Subcommands: /achievements list (all categories), /achievements category (specific category), /achievements progress (current stats)
  - Examples: "First Catch" (1 fish = 10 coins + 50 XP), "Master Angler" (100 fish = 500 coins + 1000 XP), "Legendary Hunter" (5 legendary fish = 300 coins + 750 XP)

## October 20, 2025 - Trivia System Added & Expanded
- **NEW**: Added /trivia command - test your Panfu knowledge!
  - **65 total authentic Panfu questions** based on real game history (from Panfu Wiki research)
    - 12 Panfu History questions (beta launch, user milestones, company info, timeline events)
    - 15 Panfu Character questions (Max, Ella, Kamaria, Evron, Bonez, NPCs like Eloise, Hamelot, William Pandabeard)
    - 10 Panfu Location questions (Castle, Bitterland, Underwater School, Pirate Bar, San FranPanfu)
    - 15 Panfu Gameplay questions (Gold Panda, Pokopets, minigames like Be Smarter & Pop It, quests)
  - 15 general knowledge questions with Panfu flavor
  - 6 categories: All, Panfu History, Characters, Locations, Gameplay, General Knowledge
  - 3 difficulty levels: Easy (10 coins), Medium (20 coins), Hard (30 coins)
  - Streak bonuses: 3 correct (+15), 5 (+30), 7 (+50), 10 (+100), 15 (+200)
  - 30-second time limit per question with 2-minute cooldown
  - Button-based answer selection (not text input) for instant, reliable responses
  - Fully integrated with existing coin economy and achievement system
  - Real Panfu facts verified from official Panfu Wiki

## October 20, 2025 - Explore System Added
- **NEW**: Added /explore command - adventure across Panfu island
  - 10 real Panfu locations: Beach, Volcano, Disco Dome, Lighthouse, Castle, Jungle, Dojo, Bamboo Forest, Treehouse, Mine
  - 15 authentic Panfu NPCs (verified from Panfu Wiki): Kamaria, Bruno, Gonzo, Max, Ella, Troy, Farid, Eloise, DJ Pandi, Lenny, Hamelot, Carl Caruso, Horst Hering, Momo, Bonez
  - Random encounters: find coins (10-100), discover items, meet NPCs
  - Location-specific special events (20% chance) with higher coin rewards
  - 5-minute cooldown between exploration attempts
  - Fully integrated with existing coin economy using database.updateUserCoins()
  - Each NPC has unique personality, role, greeting, and gift items based on canon
  - Coins automatically added to existing balance (no replacement)

## October 20, 2025 - Fishing System & UX Improvements
- **NEW**: Added /fish command - full fishing mini-game system
  - 4 fishing locations: Beach, Swamp, Volcano Lake, Cherry Blossom Pond
  - 16 different fish with 5 rarity tiers (Common to Legendary)
  - Junk items with humorous Panfu references
  - 3-minute cooldown between fishing attempts
  - Coin rewards based on fish rarity (5-500 coins)
  - Fish collection tracking in user profiles
  - Special flavor text for legendary catches
- **UX**: Improved all error messages to use professional embeds
  - Updated daily.js, economy.js, levelroles.js, moderation.js, level.js
  - Error messages now show as styled embeds with titles and timestamps
  - Better visual feedback for users

## October 20, 2025 - Complete Database Integration & Critical Fixes
- **CRITICAL**: Fixed daily streak tracking bug that caused streaks to reset
  - Root cause: daily.js was checking if database module exists instead of checking if it's initialized
  - Changed from `database ? 'db' : 'json'` to `database && database.isInitialized()`
  - This was causing intermittent failures where streak wouldn't save properly
- Integrated all major economy and game commands with PostgreSQL database
  - Commands now integrated: economy, treasure, volcanoescape, mystery, bananabet, stamps, quest, moderation, daily
  - All commands properly check `database.isInitialized()` before database operations
  - Automatic JSON fallback when database is unavailable
- Fixed XP tracking and level progression to use centralized database system
- Fixed quest.js helper functions to properly gate database calls with isInitialized() check
- Fixed bananabet.js to validate balances from database (not stale JSON data)
- Implemented proper level calculation formula across all commands: `Level = FLOOR(SQRT(XP / 100)) + 1`
- All coins, XP, and levels now properly integrated and consistent across all commands

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Bot Framework
- **Technology**: Discord.js v14 with slash commands and message commands
- **Runtime**: Node.js 18+
- **Command Handler**: File-based command loading from `/commands` directory
- **Intent Requirements**: Guild members, message content, guild messages for full functionality

## Data Storage Architecture
- **Dual Storage System**: Supports both PostgreSQL (via Neon serverless) and JSON file fallback
- **Database**: Neon Serverless PostgreSQL with websocket configuration
- **Fallback**: JSON files in `/data` directory when database is unavailable
- **User Profile Schema**: Tracks panda customization (name, color, accessories), economy (coins, level, XP), stats (friendship, energy, happiness), dailies, quests, pets, stamps
- **Guild Settings Schema**: Stores server-specific configuration (prefix, welcome channels, level roles)

## Leveling System
- **XP Gain**: Users earn XP from messages (cooldown-based to prevent spam)
- **Level Calculation**: Progressive XP requirements per level
- **Level Roles**: Admin-configurable role rewards at specific levels
- **Message Tracking**: Total message count stored per user

## Economy System
- **Currency**: Coins as primary currency
- **Income Sources**: Daily rewards with streak bonuses, work commands (cooldown-based), mini-games, quest completions
- **Expenses**: Panda customization, shop purchases, pet care, gambling features
- **Anti-Spam**: Cooldown mechanisms on earning commands

## Command Structure
- **Subcommand Pattern**: Main commands use subcommands for related actions (e.g., `/panda profile`, `/panda customize`)
- **Hybrid Support**: Both slash commands and prefix commands supported
- **Permission Checks**: Role-based restrictions for moderation commands
- **Interactive Components**: Uses Discord embeds, select menus, buttons, and reaction collectors

## Feature Modules

### Virtual Pandas
- Customizable appearance (colors, accessories)
- Rename functionality (costs coins)
- Stat tracking (happiness, energy, friendship)
- Profile viewing

### Mini-Games & Activities
- Rock-Paper-Scissors challenges between users
- Coin flip betting system
- Volcano escape reflex game
- Mystery solving with clues
- Treasure hunts with location-based riddles
- Multi-step quest system with progressive rewards

### Collectibles
- Stamp collection system with rarity tiers (Common to Mythic)
- Pet adoption and care mechanics (feed, play, sleep)
- Black market items from NPC "Gonzo"
- Shop system for purchasing items

### Social Features
- Friendship levels between users (10 tiers from Strangers to Legendary Duo)
- Friendship activities with point rewards
- User-to-user coin transfers

### Moderation Tools
- Coin management for staff (add/remove/set)
- User profile resets
- Server statistics viewing
- Announcement system
- Data backup creation

### Themed Content
- Weather reports for Panfu locations
- Conspiracy theories about game lore
- Time travel to different Panfu eras
- Character-specific dialogue and personality

## Deployment & Hosting
- **Web Server**: Express.js server for health checks/uptime monitoring
- **Command Deployment**: Separate script for registering slash commands to Discord API
- **Environment Variables**: `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `DATABASE_URL`

# External Dependencies

## Core Services
- **Discord API**: Via discord.js library for bot functionality
- **Neon Serverless PostgreSQL**: Primary database when available (optional)
- **Replit**: Deployment platform with built-in secrets management

## NPM Packages
- `discord.js` (v14.23.2): Discord bot framework
- `@neondatabase/serverless` (v0.9.5): PostgreSQL database client
- `express` (v4.21.2): HTTP server for keep-alive
- `ws` (v8.18.3): WebSocket support for Neon database

## API Integrations
- **Discord REST API**: For slash command registration
- **Discord Gateway**: For real-time event handling (messages, reactions, interactions)

## File System Dependencies
- JSON storage in `/data` directory as database fallback
- Command files dynamically loaded from `/commands` directory
- Utility modules in `/utils` for shared functionality