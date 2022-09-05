//Modules
const express = require("express")
const discord = require("discord.js")
const wokcommands = require("wokcommands")
const path = require('path')
const { on } = require("events")

const mongoUri = process.env.mongoDBConnectionString
const discordToken = process.env.discordToken

// Express
const app = express()

app.listen(3000, () => {
  console.log("Booting up project")
})

app.get("/", (req, res) => {
  res.send("")
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
    mongoUri: mongoUri,
    dbOptions: {
      keepAlive: true
    }
  }
  ).setDefaultPrefix(':')

  client.user?.setPresence({
    status: 'online',
    activities: {
      name: "EXPERIMENTAL"
    }
  })

  console.log("Bot is now online!")
})


client.login(discordToken)