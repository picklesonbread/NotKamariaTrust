// file: export-commands.js
const { REST, Routes } = require('discord.js');
require('dotenv').config(); // loads .env

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

if (!clientId) {
  console.error("❌ CLIENT_ID is not set in env variables");
  process.exit(1);
}
if (!token) {
  console.error("❌ DISCORD_TOKEN is not set in env variables");
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log("Fetching application commands…");
    const commands = await rest.get(
      Routes.applicationCommands(clientId)
    );
    console.log("Success! Here are your commands JSON:\n");
    console.log(JSON.stringify(commands, null, 2));
  } catch (error) {
    console.error("Error while fetching commands:", error);
  }
})();
