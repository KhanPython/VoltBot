const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require("discord.js");
const openCloud = require("../openCloudAPI");

const ENTRIES_PER_PAGE = 10;

module.exports = {
  category: "Debugging",
  description: "List all entries in an ordered datastore with pagination",

  slash: "both",
  testOnly: false,

  permissions: ["ADMINISTRATOR"],
  ephemeral: false,
  minArgs: 1,
  expectedArgs: "<leaderboardName> [scope]",
  guildOnly: true,

  options: [
    {
      name: "leaderboard",
      description: "The leaderboard/ordered datastore name",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "scope",
      description: "The datastore scope (default: global)",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],

  callback: async ({ user, args, interaction }) => {
    const leaderboardName = args[0];
    const scopeId = args[1] || "global";

    try {
      // Fetch first page to get total count
      let response = await openCloud.ListOrderedDataStoreEntries(leaderboardName, scopeId);

      if (!response.success) {
        return new EmbedBuilder()
          .setTitle("Error")
          .setColor(0xFF0000)
          .setDescription(response.status)
          .setTimestamp();
      }

      let currentEntries = response.entries || [];
      let currentPageToken = response.nextPageToken || null;
      let currentPage = 0;

      if (currentEntries.length === 0) {
        return new EmbedBuilder()
          .setTitle(`Leaderboard Entries - ${leaderboardName}`)
          .setColor(0xFFFF00)
          .setDescription("No entries found in this ordered datastore")
          .addFields({ name: "Scope", value: scopeId })
          .setTimestamp();
      }

      // Function to generate page embed
      const generatePageEmbed = (page, hasNext) => {
        let entriesText = "";
        currentEntries.forEach((entry, index) => {
          const entryNumber = page * ENTRIES_PER_PAGE + index + 1;
          entriesText += `${entryNumber}. **${entry.id}** - Value: ${entry.value}\n`;
        });

        return new EmbedBuilder()
          .setTitle(`Leaderboard Entries - ${leaderboardName}`)
          .setColor(0x00FF00)
          .setDescription(entriesText || "No entries")
          .addFields({ name: "Scope", value: scopeId })
          .setFooter({ text: `Page ${page + 1}${hasNext ? " (more available)" : ""}` })
          .setTimestamp();
      };

      // Create pagination buttons
      const createButtons = (page, hasNext) => {
        const row = new ActionRowBuilder();

        if (page > 0) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId("first")
              .setLabel("⏮ First")
              .setStyle(ButtonStyle.Primary)
          );
        }

        if (page > 0) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setLabel("◀ Previous")
              .setStyle(ButtonStyle.Primary)
          );
        }

        if (hasNext) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("Next ▶")
              .setStyle(ButtonStyle.Primary)
          );
        }

        return row;
      };

      // Send initial message
      const initialEmbed = generatePageEmbed(currentPage, !!currentPageToken);
      const initialButtons = createButtons(currentPage, !!currentPageToken);
      
      const message = await interaction.reply({
        embeds: [initialEmbed],
        components: currentPageToken ? [initialButtons] : [],
        ephemeral: true,
      });

      if (!currentPageToken) return; // No next page available

      // Handle button clicks
      const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === user.id,
        time: 5 * 60 * 1000, // 5 minutes
      });

      let previousPageTokens = []; // Store tokens to go back

      collector.on("collect", async (i) => {
        await i.deferUpdate();

        if (i.customId === "first") {
          // Go back to first page
          currentPage = 0;
          currentPageToken = null;
          previousPageTokens = [];

          const firstResponse = await openCloud.ListOrderedDataStoreEntries(
            leaderboardName,
            scopeId
          );

          if (firstResponse.success) {
            currentEntries = firstResponse.entries || [];
            currentPageToken = firstResponse.nextPageToken || null;

            const newEmbed = generatePageEmbed(currentPage, !!currentPageToken);
            const newButtons = createButtons(currentPage, !!currentPageToken);

            await message.edit({
              embeds: [newEmbed],
              components: previousPageTokens.length > 0 || currentPageToken ? [newButtons] : [],
            });
          }
        } else if (i.customId === "next" && currentPageToken) {
          // Store current token to go back
          previousPageTokens.push(currentPageToken);

          // Fetch next page
          const nextResponse = await openCloud.ListOrderedDataStoreEntries(
            leaderboardName,
            scopeId,
            currentPageToken
          );

          if (nextResponse.success) {
            currentEntries = nextResponse.entries || [];
            currentPageToken = nextResponse.nextPageToken || null;
            currentPage++;

            const newEmbed = generatePageEmbed(currentPage, !!currentPageToken);
            const newButtons = createButtons(currentPage, !!currentPageToken);

            await message.edit({
              embeds: [newEmbed],
              components: previousPageTokens.length > 0 || currentPageToken ? [newButtons] : [],
            });
          }
        } else if (i.customId === "prev" && previousPageTokens.length > 0) {
          // Go back to previous page
          currentPageToken = previousPageTokens.pop();
          currentPage--;

          const prevResponse = await openCloud.ListOrderedDataStoreEntries(
            leaderboardName,
            scopeId,
            previousPageTokens.length > 0 ? previousPageTokens[previousPageTokens.length - 1] : null
          );

          if (prevResponse.success) {
            currentEntries = prevResponse.entries || [];

            const newEmbed = generatePageEmbed(currentPage, !!currentPageToken);
            const newButtons = createButtons(currentPage, !!currentPageToken);

            await message.edit({
              embeds: [newEmbed],
              components: previousPageTokens.length > 0 || currentPageToken ? [newButtons] : [],
            });
          }
        }
      });

      collector.on("end", () => {
        // Remove buttons when pagination times out
        message.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      return new EmbedBuilder()
        .setTitle("Error")
        .setColor(0xFF0000)
        .setDescription("An unexpected error occurred")
        .addFields({ name: "Error:", value: error.message })
        .setTimestamp();
    }
  },
};
