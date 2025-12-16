const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const openCloud = require("../openCloudAPI");

module.exports = {
  category: "Moderation",
  description: "Removes leaderboard entry for a user",

  slash: "both",
  testOnly: false,

  permissions: ["ADMINISTRATOR"],
  ephemeral: false,
  minArgs: 2,
  expectedArgs: "<userId> <leaderboardName> [key]",
  guildOnly: true,

  options: [
    {
      name: "userid",
      description: "The user ID to remove from leaderboard",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: "leaderboard",
      description: "The leaderboard name",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "key",
      description: "The specific key to remove (optional, defaults to {userId})",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],

  callback: async ({ user, args }) => {
    const userId = parseInt(args[0]);
    const leaderboardName = args[1];
    const key = args[2] || null;

    if (isNaN(userId)) {
      return "Invalid user ID. Please provide a valid number.";
    }

    try {
      // First check if the key exists in the datastore
      const keyToCheck = key || `${userId}`;
      console.log(`[INFO] Checking if key exists: ${keyToCheck}`);
      
      const checkResult = await openCloud.CheckOrderedDataStoreKey(keyToCheck, leaderboardName);
      
      if (!checkResult.exists) {
        return new EmbedBuilder()
          .setTitle(`Remove Leaderboard Entry`)
          .setColor(0xFFFF00)
          .setDescription(`⚠️ Key not found in leaderboard`)
          .addFields(
            { name: "UserId:", value: userId.toString() },
            { name: "Leaderboard Name:", value: leaderboardName },
            { name: "Key searched:", value: keyToCheck },
            { name: "Result:", value: checkResult.message }
          )
          .setTimestamp();
      }

      // Key exists, proceed with removal
      const response = await openCloud.RemoveOrderedDataStoreData(userId, leaderboardName, key);

      // Return embed response
      return new EmbedBuilder()
        .setTitle(`Remove Leaderboard Entry`)
        .setColor(response.success ? 0x00FF00 : 0xFF0000)
        .setDescription(
          response.success
            ? `Entry successfully removed for user ${userId}`
            : "Unable to remove the leaderboard entry"
        )
        .addFields(
          { name: "UserId:", value: userId.toString() },
          { name: "Leaderboard Name:", value: leaderboardName },
          { name: "Key:", value: key || `${userId}` },
          { name: `${response.success ? "✅" : "❌"} Command execution status:`, value: response.status }
        )
        .setTimestamp();
    } catch (error) {
      return new EmbedBuilder()
        .setTitle("Error")
        .setColor(0xFF0000)
        .setDescription("An unexpected error occurred")
        .addField("Error:", error.message)
        .setTimestamp();
    }
  },
};
