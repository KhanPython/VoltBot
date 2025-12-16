const discord = require("discord.js");
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
      type: discord.Constants.ApplicationCommandOptionTypes.NUMBER,
    },
    {
      name: "leaderboard",
      description: "The leaderboard name",
      required: true,
      type: discord.Constants.ApplicationCommandOptionTypes.STRING,
    },
    {
      name: "key",
      description: "The specific key to remove (optional, defaults to {userId})",
      required: false,
      type: discord.Constants.ApplicationCommandOptionTypes.STRING,
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
        return new discord.MessageEmbed()
          .setTitle(`Remove Leaderboard Entry`)
          .setColor("YELLOW")
          .setDescription(`⚠️ Key not found in leaderboard`)
          .addField("UserId:", userId.toString())
          .addField("Leaderboard Name:", leaderboardName)
          .addField("Key searched:", keyToCheck)
          .addField("Result:", checkResult.message)
          .setTimestamp();
      }

      // Key exists, proceed with removal
      const response = await openCloud.RemoveOrderedDataStoreData(userId, leaderboardName, key);

      // Return embed response
      return new discord.MessageEmbed()
        .setTitle(`Remove Leaderboard Entry`)
        .setColor(response.success ? "GREEN" : "RED")
        .setDescription(
          response.success
            ? `Entry successfully removed for user ${userId}`
            : "Unable to remove the leaderboard entry"
        )
        .addField("UserId:", userId.toString())
        .addField("Leaderboard Name:", leaderboardName)
        .addField("Key:", key || `${userId}`)
        .addField(
          `${response.success ? "✅" : "❌"} Command execution status:`,
          response.status
        )
        .setTimestamp();
    } catch (error) {
      return new discord.MessageEmbed()
        .setTitle("Error")
        .setColor("RED")
        .setDescription("An unexpected error occurred")
        .addField("Error:", error.message)
        .setTimestamp();
    }
  },
};
