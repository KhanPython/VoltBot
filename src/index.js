//Modules
const discord = require("discord.js");
const wokcommands = require("wokcommands");
const path = require("path");

const discordToken = process.env.discordToken;

const Intents = discord.Intents;

const client = new discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  allowedMentions: ["users"],
});

client.on("ready", () => {
  new wokcommands(client, {
    commandsDir: path.join(__dirname, "commands"),
    featuresDir: path.join(__dirname, "features"),
  });

  console.log("Bot is now online!");
});

client.login(discordToken);
