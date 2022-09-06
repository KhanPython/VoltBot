
const { stringify } = require("querystring")
const discord = require("discord.js")
const messageToRoblox = require("../robloxMessageAPI")
const Secret = require("../models/Secret")

const UNIVERSE_ID = process.env.universeID
const TOPIC = "DiscordKick"

module.exports = {

    category: "Testing",
    description: "Sets the required API keys for the bot to function",

    slash: "both",
    testOnly: false,

    permissions: ['OWNER'],
    ephemeral: false,
    minArgs: 2,
    expectedArgs: '<msapikey> <mongodbapikey>',
    guildOnly: true,

    options: [
        {
          name: "msapikey",
          description: 'Your messaging service API key',
          required: true,
          type: discord.Constants.ApplicationCommandOptionTypes.STRING
        },
        {
          name: "mongodbapikey",
          description: 'Your mongoDb API key',
          required: true,
          type: discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ], 

    callback: async ({user, args}) => {
      const msapikey = args[0]
      const mongodbapikey = args[1]

       // Ban in the data-base
       const newSecret = await Secret.create({
        "msapikey": msapikey,
        "mongodbapikey": mongodbapikey,
      })

      return "Secrets submitted"
    }
}