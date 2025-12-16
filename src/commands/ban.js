const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const openCloud = require("./../openCloudAPI");

module.exports = {
  category: "Moderation",
  description: "Bans the player from the experience by UserId",

  slash: "both",
  testOnly: false,

  permissions: ["ADMINISTRATOR"],
  ephemeral: false,
  minArgs: 2,
  expectedArgs: "<userId> <reason> [duration] [excludealts]",
  guildOnly: true,

  options: [
    {
      name: "userid",
      description: "The user identification",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: "reason",
      description: "Reason for the ban",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "duration",
      description: "The duration to ban the user (optional - e.g., '7d', '2m', '1y' for days, months, years)",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "excludealts",
      description: "Ban alternate accounts too (default: false)",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    },
  ],

  callback: async ({ user, args }) => {
    const userId = parseInt(args[0]);
    const reason = args[1];
    const duration = args[2];
    const excludeAltAccounts = args[3] === "true" || args[3] === true || false;

    // Validate duration format if provided
    if (duration) {
      const split = duration.match(/\d+|\D+/g);
      if (!split || split.length !== 2) {
        return 'Invalid time format! Example format: "7d" where "d" = days, "m" = months, "y" = years.';
      }
      const type = split[1].toLowerCase();
      if (!["d", "m", "y"].includes(type)) {
        return 'Please use "d" (days), "m" (months), or "y" (years) for duration';
      }
    }

    try {
      // Call Open Cloud Ban function
      const response = await openCloud.BanUser(userId, reason, duration, excludeAltAccounts);

      // Return embed response
      return new EmbedBuilder()
        .setTitle(`Ban User: ${userId}`)
        .setColor(response.success ? 0x00FF00 : 0xFF0000)
        .setDescription(
          response.success
            ? `Player has been banned until ${
                response.expiresDate ? response.expiresDate.toLocaleString() : "permanent"
              }`
            : "Unable to ban the player"
        )
        .addFields(
          { name: "UserId:", value: userId.toString() },
          { name: "Ban Reason:", value: reason },
          { name: "Ban Duration:", value: `${duration == undefined ? "permanent" : duration}` },
          { name: "Exclude Alts:", value: excludeAltAccounts ? "✅ Yes" : "❌ No" },
          { name: `${response.success ? "✅" : "❌"} Command execution status:`, value: response.status }
        )
        .setTimestamp();
    } catch (error) {
      console.error("Error in ban command:", error);
      return new EmbedBuilder()
        .setTitle("Error")
        .setColor(0xFF0000)
        .setDescription("An error occurred while processing the command")
        .setTimestamp();
    }
  },
};
