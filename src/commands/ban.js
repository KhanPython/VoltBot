const discord = require("discord.js")
const messageToRoblox = require("./../robloxMessageAPI")
const robloxUserInfo = require("./../robloxUserInfo")
const Ban = require("./../models/Ban")

const UNIVERSE_ID = process.env.universeID
const TOPIC = "DiscordKick"

module.exports = {

  category: "Testing",
  description: "Bans the player from the experience by UserId",

  slash: "both",
  testOnly: false,

  permissions: ['ADMINISTRATOR'],
  ephemeral: false,
  minArgs: 2,
  expectedArgs: '<userId> <reason> <duration>',
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
      description: 'Reason for the ban',
      required: true,
      type: discord.Constants.ApplicationCommandOptionTypes.STRING
    },
    {
      name: "duration",
      description: 'The duration to ban the user (optional - minutes)',
      required: false,
      type: discord.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ user, args }) => {
    const userId = args[0]
    const reason = args[1]
    const duration = args[2] 

    // Confirm whether a user with the passed Id exists
    const userInfo = robloxUserInfo.UserInfoById(userId).then(async responseData => {
        return responseData
    })
    console.log(userInfo.status)
    // if (!userInfo.success) {
    //   return userInfo.status
    // }

    // Checks whether the passed userId is already listed     
    const result = await Ban.findOne( {userId: userId} ).exec()

    if (result) {
      return `UserId: ${userId} is already banned from the experience.`
    }

    // Notify the servers that the user has been banned, thus kicking them
    const stringifiedData = JSON.stringify({ 'UserId': userId, 'Reason': reason, 'Duration': duration })
    const embed = messageToRoblox.MessageSend(stringifiedData, UNIVERSE_ID, TOPIC).then(async responseData => {
      // Filter and calculate the ban duration
      let time
      let type
      
      const expires = new Date()
      if (!duration)  {
        expires.setFullYear(expires.getFullYear() + 100)
      } else {
        try {
          const split = duration.match(/\d+|\D+/g)
          time = parseInt(split[0])
          type = split[1].toLowerCase()
        } catch (e) {
          return "Invalid time format! Example format: \"10d\" where 'd' = days, 'h' = hours, 'm' = minutes."
        }

        if (type === 'h') {
          time *= 60
        } else if (type === 'd') {
          time *= 60 * 24
        } else if (type !== 'm') {
          return 'Please use "m", "h" or "d" for minutes, hours and days respectively'
        }
        
        expires.setMinutes(expires.getMinutes() + time)
      }
      
      // Ban in the data-base
      const newBan = await Ban.create({
        "userId": userId,
        "reason": reason,
        "duration": duration,
        "expires": expires
      })
  
      // Return embed response
      return new discord.MessageEmbed()
        .setTitle(`Ban user: ${userInfo.data["name"]}`)
        .setColor(responseData.success ? "GREEN" : "RED")
        .setDescription(responseData.success ? `Player prompted to be banned until ${expires}` : "Unable to ban the player")
        .addField("Ban reason:", reason)
        .addField("Ban duration:", `${(duration == undefined) ? 'permanent' : duration} `)
        .addField(`${responseData.success? '✅' : '❌'} Command execution status:`, responseData.status)
        .setTimestamp()
    })

    return embed
  }
}