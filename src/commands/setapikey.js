const { EmbedBuilder, ApplicationCommandOptionType, MessageFlags } = require("discord.js");
const openCloud = require("./../openCloudAPI");

module.exports = {
  category: "Config",
  description: "Set the Roblox API key for a specific universe",

  slash: "both",
  testOnly: false,

  permissions: ["ADMINISTRATOR"],
  ephemeral: true,
  minArgs: 2,
  expectedArgs: "<universeId> <apiKey>",
  guildOnly: true,

  options: [
    {
      name: "universeid",
      description: "The Roblox universe ID",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: "apikey",
      description: "The Roblox Open Cloud API key",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],

  callback: async ({ user, args, interaction }) => {
    const universeId = interaction?.options?.getNumber("universeid") || parseInt(args[0]);
    const apiKey = interaction?.options?.getString("apikey") || args[1];

    // Validate universeId
    if (!universeId || isNaN(universeId)) {
      return {
        content: "❌ Invalid Universe ID. Please provide a valid number.",
        ephemeral: true,
      };
    }

    // Validate API key (basic check - should be a string with some content)
    if (!apiKey || apiKey.trim().length === 0) {
      return {
        content: "❌ Invalid API key. Please provide a non-empty key.",
        ephemeral: true,
      };
    }

    try {
      // Store the API key in cache
      openCloud.setApiKey(universeId, apiKey);

      // Try to verify the API key by fetching universe info
      const universeInfo = await openCloud.GetUniverseName(universeId);

      const embed = new EmbedBuilder()
        .setTitle("✅ API Key Configured")
        .setColor(0x00FF00)
        .setDescription(`API key for universe ${universeId} has been cached for this session.`)
        .addFields(
          { name: "Universe ID:", value: universeId.toString() },
          { name: "Experience:", value: universeInfo.name || "Unknown" }
        )
        .setFooter({
          text: "This API key is stored in memory and will be lost when the bot restarts.",
        })
        .setTimestamp();

      if (universeInfo.icon) {
        embed.setThumbnail(universeInfo.icon);
      }

      return embed;
    } catch (error) {
      console.error("Error setting API key:", error);
      return {
        content: `❌ Error: ${error.message}. Please verify your API key is correct.`,
        ephemeral: true,
      };
    }
  },
};
