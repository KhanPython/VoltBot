/**
 * Universe Utilities
 * Helper functions for universe validation and management
 */

/**
 * Verify universe exists and return universe info
 * @param {Object} openCloud - The openCloud API module
 * @param {number} universeId - The Roblox universe ID
 * @returns {Promise<{success: boolean, universeInfo: Object|null, errorMessage: string|null}>}
 */
async function verifyUniverseExists(openCloud, universeId) {
  try {
    const universeInfo = await openCloud.GetUniverseName(universeId);
    
    if (!universeInfo.success) {
      return {
        success: false,
        universeInfo: null,
        errorMessage: `❌ Universe ${universeId} does not exist or could not be found.`
      };
    }
    
    return {
      success: true,
      universeInfo: universeInfo,
      errorMessage: null
    };
  } catch (error) {
    return {
      success: false,
      universeInfo: null,
      errorMessage: `❌ Error verifying universe: ${error.message}`
    };
  }
}

module.exports = {
  verifyUniverseExists,
};
