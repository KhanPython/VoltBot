const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
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
      type: ApplicationCommandOptionType.Number,
    },
  ],

  callback: async ({ user, args }) => {
    const userId = parseInt(args[0]);

    try {
      // Call Open Cloud Unban function
      const response = await openCloud.UnbanUser(userId);

      // Return embed response
      return new EmbedBuilder()
        .setTitle(`Unban User: ${userId}`)
        .setColor(response.success ? 0x00FF00 : 0xFF0000)
        .setDescription(
          response.success
            ? `Player has been unbanned`
            : "Unable to unban the player"
        )
        .addFields(
          { name: "UserId:", value: userId.toString() },
          { name: `${response.success ? "✅" : "❌"} Command execution status:`, value: response.status }
        )
        .setTimestamp();
    } catch (error) {
      console.error("Error in unban command:", error);
      return new EmbedBuilder()
        .setTitle("Error")
        .setColor(0xFF0000)
        .setDescription("An error occurred while processing the command")
        .setTimestamp();
    }
  },
};
