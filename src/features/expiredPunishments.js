const discord = require("discord.js");
const messageToRoblox = require("./../robloxMessageAPI");
const Ban = require("./../models/Ban");
const ServerBan = require("./../models/ServerBan");

const REFRESH_TIME = 1000 * 120;

module.exports = (client) => {
  const check = async () => {
    const query = {
      expires: { $lt: new Date() },
    };

    // Remove expired bans
    await Ban.deleteMany(query)
      .then(() => {
        // console.log("Deleted expired bans")
      })
      .catch((err) => {
        console.log(`Unable to delete expired bans: ${err}`);
      });

    // Remove expired server bans
    await ServerBan.deleteMany(query)
      .then(() => {
        // console.log("Deleted expired server bans")
      })
      .catch((err) => {
        console.log(`Unable to delete expired server bans: ${err}`);
      });

    setTimeout(check, REFRESH_TIME);
  };
  check();
};
