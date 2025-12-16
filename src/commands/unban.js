const discord = require("discord.js");
const openCloud = require("./../openCloudAPI");

module.exports = {
  category: "Moderation",
  description: "Unbans a player from the experience by UserId",

  slash: "both",
  testOnly: false,

  permissions: ["ADMINISTRATOR"],
  ephemeral: false,
  minArgs: 1,
  expectedArgs: "<userId>",
  guildOnly: true,

  options: [
    {
      name: "userid",
      description: "The user identification",
      required: true,
      type: discord.Constants.ApplicationCommandOptionTypes.NUMBER,
    },
  ],

  callback: async ({ user, args }) => {
    const userId = parseInt(args[0]);

    try {
      // Call Open Cloud Unban function
      const response = await openCloud.UnbanUser(userId);

      // Return embed response
      return new discord.MessageEmbed()
        .setTitle(`Unban User: ${userId}`)
        .setColor(response.success ? "GREEN" : "RED")
        .setDescription(
          response.success
            ? `Player has been unbanned`
            : "Unable to unban the player"
        )
        .addField("UserId:", userId.toString())
        .addField(
          `${response.success ? "✅" : "❌"} Command execution status:`,
          response.status
        )
        .setTimestamp();
    } catch (error) {
      console.error("Error in unban command:", error);
      return new discord.MessageEmbed()
        .setTitle("Error")
        .setColor("RED")
        .setDescription("An error occurred while processing the command")
        .setTimestamp();
    }
  },
};
