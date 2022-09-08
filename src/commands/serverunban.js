const { stringify } = require("querystring");
const discord = require("discord.js");
const messageToRoblox = require("../robloxMessageAPI");
const ServerBan = require("./../models/ServerBan");

const UNIVERSE_ID = process.env.universeID;
const API_KEY = process.env.robloxAPIKey;
const TOPIC = "DiscordServerUnBan";

module.exports = {
  category: "Testing",
  description: "Unbans the player from the optionally specified server",

  slash: "both",
  testOnly: false,

  permissions: ["ADMINISTRATOR"],
  ephemeral: false,
  minArgs: 1,
  expectedArgs: "<userId> <jobid>",
  guildOnly: true,

  options: [
    {
      name: "userid",
      description: "The user identification of a player",
      required: true,
      type: discord.Constants.ApplicationCommandOptionTypes.NUMBER,
    },
    {
      name: "jobid",
      description: "The server game job Id",
      required: false,
      type: discord.Constants.ApplicationCommandOptionTypes.STRING,
    },
  ],

  callback: async ({ user, args }) => {
    const userId = args[0];
    const jobId = args[1];

    // Notify the servers that the user has been server unbanned
    const stringifiedData = JSON.stringify({ UserId: userId, JobId: jobId });
    const embed = messageToRoblox
      .MessageSend(stringifiedData, UNIVERSE_ID, TOPIC, API_KEY)
      .then(async (responseData) => {
        // Checks whether the passed userId by jobId is already listed
        const result = await ServerBan.findOne(
          jobId ? { userId: userId, jobId: jobId } : { userId: userId }
        ).exec();

        if (!result) {
          return jobId
            ? `UserId: ${userId} is not banned from server: ${jobId}`
            : `UserId: ${userId} is not server banned.`;
        }

        return await ServerBan.deleteOne(
          jobId ? { userId: userId, jobId: jobId } : { userId: userId }
        )
          .then(() => {
            // Return embed response
            return new discord.MessageEmbed()
              .setTitle(`Server unban user: ${userId}`)
              .setColor(responseData.success ? "GREEN" : "RED")
              .setDescription(
                responseData.success
                  ? `Player prompted to be server unbanned`
                  : "Unable to server unban the player"
              )
              .addField(
                `${
                  responseData.success ? "✅" : "❌"
                } Command execution status:`,
                responseData.status
              )
              .setTimestamp();
          })
          .catch((err) => {
            return `${err}`;
          });
      });

    return embed;
  },
};
