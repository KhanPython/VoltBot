//Modules
const express = require("express")
const discord = require("discord.js")
const wokcommands = require("wokcommands")
const path = require('path')

const mongoUri = process.env.mongoDBConnectionString

// Express
const app = express()

app.listen(3000, () => {
  console.log("Starting the project")
})

app.get("/", (req, res) => {
  res.send("Test")
})

// Test
// Discord bot related
const Intents = discord.Intents

const client = new discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  allowedMentions: ["users"]
})

client.on("ready", () => {
  new wokcommands(client, {
    commandsDir: path.join(__dirname, "commands"),
    featuresDir: path.join(__dirname, "features"),
    testServers: "997985683534778419",
    mongoUri: mongoUri,
    dbOptions: {
      keepAlive: true
    }
  }
  ).setDefaultPrefix(':')
  console.log("Bot is now online!")
})


client.login(process.env.token)