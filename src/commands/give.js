const { EmbedBuilder, ApplicationCommandOptionType, MessageFlags } = require("discord.js");
const openCloud = require("./../openCloudAPI");
const apiCache = require("./../utils/apiCache");

module.exports = {
  category: "Economy",
  description: "Give currency to a player using their UserId",

  slash: "both",
  testOnly: false,

  permissions: ["ADMINISTRATOR"],
  ephemeral: false,
  minArgs: 3,
  expectedArgs: "<userId> <amount> <universeId>",
  guildOnly: true,

  options: [
    {
      name: "userid",
      description: "The Roblox user identification",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: "amount",
      description: "The amount of currency to give",
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
    const amount = interaction?.options?.getNumber("amount") || parseInt(args[1]);
    const universeId = interaction?.options?.getNumber("universeid") || parseInt(args[2]);

    // Validate universeId
    if (!universeId || isNaN(universeId)) {
      return "Please provide a valid Universe ID.";
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return "Please provide a valid positive amount.";
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

      // Get current currency data
      const currentResult = await openCloud.GetPlayerData(userId, universeId);
      
      let newCurrency = amount;
      if (currentResult.success && currentResult.data) {
        newCurrency = (currentResult.data.currency || 0) + amount;
      }

      // Get experience name
      const universeInfo = await openCloud.GetUniverseName(universeId);

      // Update currency in datastore
      const response = await openCloud.SetPlayerData(userId, {
        currency: newCurrency,
        lastUpdated: new Date().toISOString(),
      }, universeId);

      // Return embed response
      const embed = new EmbedBuilder()
        .setTitle(`Give Currency to ${userId}`)
        .setColor(response.success ? 0x00FF00 : 0xFF0000)
        .setDescription(`**Experience:** ${universeInfo.name}`)
        .addFields(
          { name: "UserId:", value: userId.toString() },
          { name: "Amount Given:", value: amount.toString() },
          { name: "New Total:", value: newCurrency.toString() }
        )
        .setFooter({
          text: response.success
            ? `Successfully awarded ${amount} currency`
            : response.status
        })
        .setTimestamp();
      
      if (universeInfo.icon) {
        embed.setThumbnail(universeInfo.icon);
      }
      
      return embed;
    } catch (error) {
      console.error("Error in give command:", error);
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle("Error")
          .setColor(0xFF0000)
          .setDescription(`Error: ${error.message}`)
          .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
