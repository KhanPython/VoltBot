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
    {
      name: "universeid",
      description: "Universe ID (optional - defaults to .env value)",
      required: false,
      type: ApplicationCommandOptionType.Number,
    },
  ],

  callback: async ({ user, args, interaction }) => {
    const userId = interaction?.options?.getNumber("userid") || parseInt(args[0]);
    const leaderboardName = interaction?.options?.getString("leaderboard") || args[1];
    const key = interaction?.options?.getString("key") || null;
    const universeId = interaction?.options?.getNumber("universeid") || null;

    if (isNaN(userId)) {
      return "Invalid user ID. Please provide a valid number.";
    }

    try {
      // Get experience name
      const universeInfo = await openCloud.GetUniverseName(universeId);
      
      // First check if the key exists in the datastore
      const keyToCheck = key || `${userId}`;
      console.log(`[INFO] Checking if key exists: ${keyToCheck}`);
      
      const checkResult = await openCloud.CheckOrderedDataStoreKey(keyToCheck, leaderboardName, "global", universeId);
      
      if (!checkResult.exists) {
        const notFoundEmbed = new EmbedBuilder()
          .setTitle(`Remove Leaderboard Entry`)
          .setColor(0xFFFF00)
          .setDescription(`**Experience:** ${universeInfo.name}\n\n⚠️ ${checkResult.message}`)
          .addFields(
            { name: "UserId:", value: userId.toString() },
            { name: "Leaderboard Name:", value: leaderboardName },
            { name: "Key searched:", value: keyToCheck }
          )
          .setTimestamp();
        
        if (universeInfo.icon) {
          notFoundEmbed.setThumbnail(universeInfo.icon);
        }
        
        return notFoundEmbed;
      }

      // Key exists, proceed with removal
      const response = await openCloud.RemoveOrderedDataStoreData(userId, leaderboardName, key, "global", universeId);

      // Return embed response
      const embed = new EmbedBuilder()
        .setTitle(`Remove Leaderboard Entry`)
        .setColor(response.success ? 0x00FF00 : 0xFF0000)
        .setDescription(
          `**Experience:** ${universeInfo.name}\n\n${
            response.success
              ? `Entry successfully removed for user ${userId}`
              : response.status
          }`
        )
        .addFields(
          { name: "UserId:", value: userId.toString() },
          { name: "Leaderboard Name:", value: leaderboardName },
          { name: "Key:", value: key || `${userId}` }
        )
        .setTimestamp();
      
      if (universeInfo.icon) {
        embed.setThumbnail(universeInfo.icon);
      }
      
      return embed;
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
