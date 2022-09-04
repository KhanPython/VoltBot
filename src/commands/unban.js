const discord = require("discord.js")
const messageToRoblox = require("./../robloxMessageAPI")
const Ban = require("./../models/Ban")

const UNIVERSE_ID = process.env.universeID
const TOPIC = "DiscordUnban"

module.exports = {

  category: "Testing",
  description: "Bans the player from the experience by UserId",

  slash: "both",
  testOnly: true,

  permissions: ['ADMINISTRATOR'],
  ephemeral: false,
  minArgs: 1,
  expectedArgs: '<userId>',
  guildOnly: true,

  options: [
    {
      name: "userid",
      description: 'The user identification',
      required: true,
      type: discord.Constants.ApplicationCommandOptionTypes.NUMBER
    },
  ],

  callback: async ({ user, args }) => {
    const userId = args[0]

    // Notify the servers that the user has been unbanned
    const stringifiedData = JSON.stringify({ 'UserId': userId })
    const embed = messageToRoblox.MessageSend(stringifiedData, UNIVERSE_ID, TOPIC).then(async responseData => {

      // Checks whether the passed userId is already listed     
      const result = await Ban.findOne( {userId: userId} ).exec()

      if (!result) {
        return `UserId: ${userId} is not banned.`
      }

      return await Ban.deleteOne( {userId: userId} )
        .then(() => {
          // Return embed response
          return new discord.MessageEmbed()
          .setTitle(`Unban user: ${userId}`)
          .setColor(responseData.success ? "GREEN" : "RED")
          .setDescription(responseData.success ? `Player prompted to be unbanned` : "Unable to unban the player")
          .addField(`${responseData.success? '✅' : '❌'} Command execution status:`, responseData.status)
          .setTimestamp()
        })
        .catch((err) => {
          return `${err}`
        })
    })

    return embed
  }
}