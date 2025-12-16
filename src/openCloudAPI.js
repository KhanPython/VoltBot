const axios = require("axios").default;
const { OpenCloud, DataStoreService } = require("rbxcloud");

// Configure OpenCloud with environment variables
OpenCloud.Configure({
  DataStoreService: process.env.robloxAPIKey,
  UniverseId: parseInt(process.env.universeID),
});

// ============================================
// DATA STORE OPERATIONS
// ============================================

/**
 * Get a value from the player currency datastore
 * @param {number} userId - The Roblox user ID
 * @param {string} datastoreName - Name of the datastore (default: "player_currency")
 * @returns {Promise<{success: boolean, data: any, status: string}>}
 */
exports.GetPlayerData = async function (userId, datastoreName = "player_currency") {
  try {
    const datastore = DataStoreService.GetDataStore(datastoreName);
    const [data, keyInfo] = await datastore.GetAsync(`player_${userId}`);

    return {
      success: true,
      data: data,
      keyInfo: keyInfo,
      status: "**Success**",
    };
  } catch (error) {
    console.error(`Error getting data for user ${userId}:`, error);
    return {
      success: false,
      data: null,
      status: `**Error:** ${error.message}`,
    };
  }
};

/**
 * Set a value in the player currency datastore
 * @param {number} userId - The Roblox user ID
 * @param {any} value - The data to store
 * @param {string} datastoreName - Name of the datastore (default: "player_currency")
 * @returns {Promise<{success: boolean, status: string}>}
 */
exports.SetPlayerData = async function (userId, value, datastoreName = "player_currency") {
  try {
    const datastore = DataStoreService.GetDataStore(datastoreName);
    await datastore.SetAsync(`player_${userId}`, value);

    return {
      success: true,
      status: "**Success**",
    };
  } catch (error) {
    console.error(`Error setting data for user ${userId}:`, error);
    return {
      success: false,
      status: `**Error:** ${error.message}`,
    };
  }
};

/**
 * Increment a value in the datastore
 * @param {number} userId - The Roblox user ID
 * @param {number} amount - The amount to increment by
 * @param {string} datastoreName - Name of the datastore (default: "player_currency")
 * @returns {Promise<{success: boolean, newValue: number, status: string}>}
 */
exports.IncrementPlayerData = async function (userId, amount, datastoreName = "player_currency") {
  try {
    const datastore = DataStoreService.GetDataStore(datastoreName);
    const [newValue, keyInfo] = await datastore.IncrementAsync(`player_${userId}`, amount);

    return {
      success: true,
      newValue: newValue,
      status: "**Success**",
    };
  } catch (error) {
    console.error(`Error incrementing data for user ${userId}:`, error);
    return {
      success: false,
      newValue: null,
      status: `**Error:** ${error.message}`,
    };
  }
};

/**
 * Update a value in the datastore using an update function
 * @param {number} userId - The Roblox user ID
 * @param {Function} updateFunction - Function that takes (data, keyInfo) and returns new data
 * @param {string} datastoreName - Name of the datastore
 * @returns {Promise<{success: boolean, newValue: any, status: string}>}
 */
exports.UpdatePlayerData = async function (userId, updateFunction, datastoreName = "player_currency") {
  try {
    const datastore = DataStoreService.GetDataStore(datastoreName);
    const newValue = await datastore.UpdateAsync(`player_${userId}`, updateFunction);

    return {
      success: true,
      newValue: newValue,
      status: "**Success**",
    };
  } catch (error) {
    console.error(`Error updating data for user ${userId}:`, error);
    return {
      success: false,
      newValue: null,
      status: `**Error:** ${error.message}`,
    };
  }
};

/**
 * Delete a value from the datastore
 * @param {number} userId - The Roblox user ID
 * @param {string} datastoreName - Name of the datastore
 * @returns {Promise<{success: boolean, oldValue: any, status: string}>}
 */
exports.RemovePlayerData = async function (userId, datastoreName = "player_currency") {
  try {
    const datastore = DataStoreService.GetDataStore(datastoreName);
    const oldValue = await datastore.RemoveAsync(`player_${userId}`);

    return {
      success: true,
      oldValue: oldValue,
      status: "**Success**",
    };
  } catch (error) {
    console.error(`Error removing data for user ${userId}:`, error);
    return {
      success: false,
      oldValue: null,
      status: `**Error:** ${error.message}`,
    };
  }
};

// ============================================
// USER RESTRICTIONS API (BAN MANAGEMENT)
// ============================================

/**
 * Ban a user using Roblox Open Cloud User Restrictions API
 * @param {number} userId - The Roblox user ID
 * @param {string} reason - Reason for the ban
 * @param {string} duration - Duration (e.g., "10d", "2h", "30m") or null for permanent
 * @returns {Promise<{success: boolean, status: string, expiresDate: Date|null}>}
 */
exports.BanUser = async function (userId, reason, duration) {
  try {
    const universeId = parseInt(process.env.universeID);
    const apiKey = process.env.robloxAPIKey;

    let durationSeconds = null;
    let expiresDate = null;

    if (duration) {
      durationSeconds = parseDuration(duration);
      expiresDate = new Date(Date.now() + durationSeconds * 1000);
    }

    const payload = {
      userId: userId,
      reason: reason,
    };

    // Add duration if not permanent
    if (durationSeconds) {
      payload.duration = `${durationSeconds}s`;
    }

    const response = await axios.post(
      `https://apis.roblox.com/cloud/v2/universes/${universeId}/user-restrictions`,
      payload,
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      return {
        success: true,
        status: "**Success**",
        expiresDate: expiresDate,
      };
    }

    return {
      success: false,
      status: "**Error:** Unknown error occurred",
      expiresDate: null,
    };
  } catch (error) {
    console.error(`Error banning user ${userId}:`, error.response?.data || error.message);
    const status = error.response?.status;

    if (status === 401) {
      return {
        success: false,
        status: "**Error:** Invalid API key",
        expiresDate: null,
      };
    }
    if (status === 403) {
      return {
        success: false,
        status: "**Error:** Access denied",
        expiresDate: null,
      };
    }
    if (status === 400) {
      return {
        success: false,
        status: "**Error:** Invalid request - User may already be banned",
        expiresDate: null,
      };
    }

    return {
      success: false,
      status: `**Error:** ${error.message}`,
      expiresDate: null,
    };
  }
};

/**
 * Unban a user using Roblox Open Cloud User Restrictions API
 * @param {number} userId - The Roblox user ID
 * @returns {Promise<{success: boolean, status: string}>}
 */
exports.UnbanUser = async function (userId) {
  try {
    const universeId = parseInt(process.env.universeID);
    const apiKey = process.env.robloxAPIKey;

    // First, get the user restriction ID
    const listResponse = await axios.get(
      `https://apis.roblox.com/cloud/v2/universes/${universeId}/user-restrictions`,
      {
        headers: {
          "x-api-key": apiKey,
        },
        params: {
          userId: userId,
        },
      }
    );

    if (!listResponse.data.userRestrictions || listResponse.data.userRestrictions.length === 0) {
      return {
        success: false,
        status: `**Error:** User ${userId} is not banned`,
      };
    }

    // Delete the user restriction
    const restrictionId = listResponse.data.userRestrictions[0].id;
    const deleteResponse = await axios.delete(
      `https://apis.roblox.com/cloud/v2/universes/${universeId}/user-restrictions/${restrictionId}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (deleteResponse.status === 200 || deleteResponse.status === 204) {
      return {
        success: true,
        status: "**Success**",
      };
    }

    return {
      success: false,
      status: "**Error:** Failed to unban user",
    };
  } catch (error) {
    console.error(`Error unbanning user ${userId}:`, error.response?.data || error.message);
    const status = error.response?.status;

    if (status === 401) {
      return {
        success: false,
        status: "**Error:** Invalid API key",
      };
    }
    if (status === 404) {
      return {
        success: false,
        status: `**Error:** User ${userId} is not banned`,
      };
    }

    return {
      success: false,
      status: `**Error:** ${error.message}`,
    };
  }
};


// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse duration string to seconds
 * @param {string} duration - Duration string (e.g., "10d", "2h", "30m")
 * @returns {number} Duration in seconds, or null if invalid
 */
function parseDuration(duration) {
  if (!duration) return null;

  try {
    const split = duration.match(/\d+|\D+/g);
    let time = parseInt(split[0]);
    const type = split[1]?.toLowerCase() || "m";

    if (type === "h") {
      time *= 60 * 60;
    } else if (type === "d") {
      time *= 60 * 60 * 24;
    } else if (type === "m") {
      time *= 60;
    } else {
      return null;
    }

    return time;
  } catch (e) {
    return null;
  }
}

exports.parseDuration = parseDuration;

