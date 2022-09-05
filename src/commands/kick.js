
const { stringify } = require("querystring")
const discord = require("discord.js")
const messageToRoblox = require("./../robloxMessageAPI")

const UNIVERSE_ID = process.env.universeID
const TOPIC = "DiscordKick"

module.exports = {

    category: "Testing",
    description: "Kicks the player from server by UserId",

    slash: "both",
    testOnly: false,

    permissions: ['ADMINISTRATOR'],
    ephemeral: false,
    minArgs: 2,
    expectedArgs: '<userId> <reason>',
    guildOnly: true,

    options: [
        {
          name: "userid",
          description: 'The user identification',
          required: true,
          type: discord.Constants.ApplicationCommandOptionTypes.NUMBER
        },
        {
          name: "reason",
          description: 'Reason for the kick',
          required: true,
          type: discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ], 

    callback: ({user, args}) => {
      const userId = args[0]
      const reason = args[1]

      const stringifiedData = JSON.stringify({'UserId': userId, 'Reason': reason})
      const embed = messageToRoblox.MessageSend(stringifiedData, UNIVERSE_ID, TOPIC).then(responseData => {
          return new discord.MessageEmbed()
          .setTitle(`Kick user: ${userId}`)
          .setColor(responseData.success? "GREEN" : "RED")
          .setDescription(responseData.success? "Player prompted to be kicked" : "Unable to kick the player")
          .addField("Kick reason:", reason)
          .addField(`${responseData.success? '✅' : '❌'} Command execution status:`, responseData.status)
          .setTimestamp()
      })

      return embed
    }
}