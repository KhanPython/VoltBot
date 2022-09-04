
const { stringify } = require("querystring")
const discord = require("discord.js")
const messageToRoblox = require("./../robloxMessageAPI")
const ServerBan = require("./../models/ServerBan")

const UNIVERSE_ID = process.env.universeID
const TOPIC = "DiscordServerBan"

module.exports = {

    category: "Testing",
    description: "Server bans the player from server by UserId with for an optional period",

    slash: "both",
    testOnly: true,

    permissions: ['ADMINISTRATOR'],
    ephemeral: false,
    minArgs: 3,
    expectedArgs: '<userId> <reason> <jobId> <duration>',
    guildOnly: true,

    options: [
        {
          name: "userid",
          description: 'The user identification of a player',
          required: true,
          type: discord.Constants.ApplicationCommandOptionTypes.NUMBER
        },
        {
          name: "reason",
          description: 'Display reason for the kick',
          required: true,
          type: discord.Constants.ApplicationCommandOptionTypes.STRING
        },
        {
         name: "jobid",
          description: 'Ban from a specific server by jobId',
          required: true,
          type: discord.Constants.ApplicationCommandOptionTypes.NUMBER
        },
        {
          name: "duration",
          description: '(Optional) server ban for a specific duration',
          required: false,
          type: discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ], 


    callback: async ({ user, args }) => {
      const userId = args[0]
      const reason = args[1]
      const jobId = args[2]
      const duration = args[3] 
  
      // Checks whether the passed userId is already listed     
      const result = await ServerBan.findOne( {userId: userId} ).exec()
  
      if (result) {
        return `UserId: ${userId} is already banned from the server.`
      }
  
      // Notify the servers that the user has been banned, thus kicking them
      const stringifiedData = JSON.stringify({ 'UserId': userId, 'Reason': reason, 'JobId': jobId, 'Duration': duration })
      const embed = messageToRoblox.MessageSend(stringifiedData, UNIVERSE_ID, TOPIC).then(async responseData => {
        // Filter and calculate the ban period
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
          const newServerBan = await ServerBan.create({
            "userId": userId,
            "reason": reason,
            "jobId": jobId,
            "duration": duration,
            "expires": expires,
          })
    
          // Return embed response
          return new discord.MessageEmbed()
            .setTitle("Server ban user:", userId)
            .setColor(responseData.success ? "GREEN" : "RED")
            .setDescription(responseData.success ? `Player prompted to be server banned until ${expires} from serverId: ${jobId}` : "Unable to server ban the player")
            .addField("Server ban reason:", reason)
            .addField("Server ban duration:", `${(duration == undefined) ? 'permanent' : duration} `)
            .addField(`${responseData.success? '✅' : '❌'} Command execution status:`, responseData.status)
            .setTimestamp()
        })
  
        return embed
    }  

}