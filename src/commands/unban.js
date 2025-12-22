const { EmbedBuilder, ApplicationCommandOptionType, MessageFlags } = require("discord.js");
const openCloud = require("./../openCloudAPI");
const apiCache = require("./../utils/apiCache");

module.exports = {
  category: "Moderation",
  description: "Unbans a player from the experience by UserId",

  slash: "both",
  testOnly: false,

  permissions: ["ADMINISTRATOR"],
  ephemeral: false,
  minArgs: 2,
  expectedArgs: "<userId> <universeId>",
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
      description: "Universe ID (required)",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
  ],

  callback: async ({ user, args, interaction }) => {
    const userId = interaction?.options?.getNumber("userid") || parseInt(args[0]);
    const universeId = interaction?.options?.getNumber("universeid") || parseInt(args[1]);

    // Validate universeId
    if (!universeId || isNaN(universeId)) {
      return "Please provide a valid Universe ID.";
    }

    try {
      // Check if API key is cached, if not prompt user
      if (!openCloud.hasApiKey(universeId)) {
        await interaction.reply({
          embeds: [apiCache.createMissingApiKeyEmbed(universeId)],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

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
        .setDescription(`Error: ${error.message}`)
        .setTimestamp();
    }
  },
};
