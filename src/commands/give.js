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
  ],

  callback: async ({ user, args }) => {
    const userId = parseInt(args[0]);
    const amount = parseInt(args[1]);

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

      // Update currency in datastore
      const response = await openCloud.SetPlayerData(userId, {
        currency: newCurrency,
        lastUpdated: new Date().toISOString(),
      });

      // Return embed response
      return new EmbedBuilder()
        .setTitle(`Give Currency to ${userId}`)
        .setColor(response.success ? 0x00FF00 : 0xFF0000)
        .setDescription(
          response.success
            ? `Successfully awarded ${amount} currency`
            : "Failed to award currency"
        )
        .addFields(
          { name: "UserId:", value: userId.toString() },
          { name: "Amount Given:", value: amount.toString() },
          { name: "New Total:", value: newCurrency.toString() },
          { name: `${response.success ? "✅" : "❌"} Command execution status:`, value: response.status }
        )
        .setTimestamp();
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
