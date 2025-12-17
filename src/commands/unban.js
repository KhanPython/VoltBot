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
    {
      name: "universeid",
      description: "Universe ID (optional - defaults to .env value)",
      required: false,
      type: ApplicationCommandOptionType.Number,
    },
  ],

  callback: async ({ user, args, interaction }) => {
    const userId = interaction?.options?.getNumber("userid") || parseInt(args[0]);
    const universeId = interaction?.options?.getNumber("universeid") || null;

    try {
      // Get experience name
      const universeInfo = await openCloud.GetUniverseName(universeId);
      
      // Call Open Cloud Unban function
      const response = await openCloud.UnbanUser(userId, universeId);

      // Return embed response
      const embed = new EmbedBuilder()
        .setTitle(`Unban User: ${userId}`)
        .setColor(response.success ? 0x00FF00 : 0xFF0000)
        .setDescription(`**Experience:** ${universeInfo.name}`)
        .addFields(
          { name: "UserId:", value: userId.toString() }
        )
        .setFooter({
          text: response.success
            ? "Player has been unbanned"
            : response.status
        })
        .setTimestamp();
      
      if (universeInfo.icon) {
        embed.setThumbnail(universeInfo.icon);
      }
      
      return embed;
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
