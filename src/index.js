//Modules
require("dotenv").config();
const discord = require("discord.js");
const wokcommands = require("wokcommands");
const path = require("path");

const discordToken = process.env.discordToken;

const Intents = discord.Intents;

const client = new discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  allowedMentions: ["users"],
});

client.on("ready", async () => {
  try {
    // Clear all global commands
    await client.application?.commands.set([]);
    console.log("Cleared all global commands");
    
    // Now load new commands
    new wokcommands(client, {
      commandsDir: path.join(__dirname, "commands"),
      featuresDir: path.join(__dirname, "features"),
      mongoUri: "",
    });

    console.log("Bot is ready!");
  } catch (error) {
    console.error("Error:", error);
  }
});

client.login(discordToken);
