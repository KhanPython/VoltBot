const discord = require("discord.js")
const Secret = require("../models/Secret")
const argon2 = require("argon2")

module.exports = {

    category: "Testing",
    description: "Sets the required API keys for the bot to function",

    slash: "both",
    testOnly: false,

    permissions: ['ADMINISTRATOR'],
    ephemeral: true,
    minArgs: 3,
    expectedArgs: '<msapikey> <mongodbapikey> <universeid>',
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
        },
        {
          name: "universeid",
          description: 'Your universe Id',
          required: true,
          type: discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ], 

    callback: async ({args, guild}) => {
        // Delete the previous submission from our db (if there is one)
        await Secret.deleteOne( {guildid: guild.id} )

        // Hash our API keys with a salt from a .env.
        const salt = Buffer.from(process.env.serverSalt)
        const msapikey = await argon2.hash(args[0], {salt: salt})
        const mongodbapikey = await argon2.hash(args[1], {salt: salt})
        const universeid = args[2]

        // Create a new db collection storing all of API secrets.
        await Secret.create({
          "msapikey": msapikey,
          "mongodbapikey": mongodbapikey,
          "universeid": universeid,
          "guildid": guild.id
        })

        return new discord.MessageEmbed()
        .setTitle(`Server ${guild.id} secrets`)
        .setColor("BLUE")
        .setDescription("API keys successfully saved!")
        .addField("Remember to never share API keys with anyone as they may grant access for malicious requests!")
        .setTimestamp()
    }
}