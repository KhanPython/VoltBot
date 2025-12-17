const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const openCloud = require("./../openCloudAPI");

module.exports = {
  category: "Economy",
  description: "Give currency to a player using their UserId",

  slash: "both",
  testOnly: false,

  permissions: ["ADMINISTRATOR"],
  ephemeral: false,
  minArgs: 2,
  expectedArgs: "<userId> <amount>",
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
      description: "Universe ID (optional - defaults to .env value)",
      required: false,
      type: ApplicationCommandOptionType.Number,
    },
  ],

  callback: async ({ user, args, interaction }) => {
    const userId = interaction?.options?.getNumber("userid") || parseInt(args[0]);
    const amount = interaction?.options?.getNumber("amount") || parseInt(args[1]);
    const universeId = interaction?.options?.getNumber("universeid") || null;

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return "Please provide a valid positive amount.";
    }

    try {
      // Get current currency data
      const currentResult = await openCloud.GetPlayerData(userId);
      
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
      });

      // Return embed response
      const embed = new EmbedBuilder()
        .setTitle(`Give Currency to ${userId}`)
        .setColor(response.success ? 0x00FF00 : 0xFF0000)
        .setDescription(
          `**Experience:** ${universeInfo.name}\n\n${
            response.success
              ? `Successfully awarded ${amount} currency`
              : response.status
          }`
        )
        .addFields(
          { name: "UserId:", value: userId.toString() },
          { name: "Amount Given:", value: amount.toString() },
          { name: "New Total:", value: newCurrency.toString() }
        )
        .setTimestamp();
      
      if (universeInfo.icon) {
        embed.setThumbnail(universeInfo.icon);
      }
      
      return embed;
    } catch (error) {
      console.error("Error in give command:", error);
      return new EmbedBuilder()
        .setTitle("Error")
        .setColor(0xFF0000)
        .setDescription("An error occurred while processing the command")
        .setTimestamp();
    }
  },
};
