const discord = require("discord.js");
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
      type: discord.Constants.ApplicationCommandOptionTypes.NUMBER,
    },
    {
      name: "reason",
      description: "Reason for the ban",
      required: true,
      type: discord.Constants.ApplicationCommandOptionTypes.STRING,
    },
    {
      name: "duration",
      description: "The duration to ban the user (optional - e.g., '7d', '2m', '1y' for days, months, years)",
      required: false,
      type: discord.Constants.ApplicationCommandOptionTypes.STRING,
    },
    {
      name: "excludealts",
      description: "Ban alternate accounts too (default: false)",
      required: false,
      type: discord.Constants.ApplicationCommandOptionTypes.BOOLEAN,
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
      return new discord.MessageEmbed()
        .setTitle(`Ban User: ${userId}`)
        .setColor(response.success ? "GREEN" : "RED")
        .setDescription(
          response.success
            ? `Player has been banned until ${
                response.expiresDate ? response.expiresDate.toLocaleString() : "permanent"
              }`
            : "Unable to ban the player"
        )
        .addField("UserId:", userId.toString())
        .addField("Ban Reason:", reason)
        .addField(
          "Ban Duration:",
          `${duration == undefined ? "permanent" : duration}`
        )
        .addField(
          "Exclude Alts:",
          excludeAltAccounts ? "✅ Yes" : "❌ No"
        )
        .addField(
          `${response.success ? "✅" : "❌"} Command execution status:`,
          response.status
        )
        .setTimestamp();
    } catch (error) {
      console.error("Error in ban command:", error);
      return new discord.MessageEmbed()
        .setTitle("Error")
        .setColor("RED")
        .setDescription("An error occurred while processing the command")
        .setTimestamp();
    }
  },
};
