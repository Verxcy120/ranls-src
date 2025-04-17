const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs").promises;
const config = require('../../data/discord/config.json');
const path = require('path');

// Helper to check if a file or folder exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlink")
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2)
    .setDescription("Unlink your xbox Profile from this Bot"),
  execute: async (interaction) => {
    try {
      // Initial reply while loading account data
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Loading Account Data")
            .setDescription("Checking data, this may take some time.")
            .setColor(config.embeds.color)
        ],
        components: [],
        ephemeral: true,
      });

      const usersFile = './data/user/users.json';
      let data = {};

      // Load user data if the file exists
      if (await fileExists(usersFile)) {
        const fileData = await fs.readFile(usersFile, 'utf8');
        data = JSON.parse(fileData);
      } else {
        // If no user data exists, report an error.
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Account Error")
              .setDescription("No user data found.")
              .setColor(config.embeds.color)
          ]
        });
        return;
      }

      // Check if the user's profile folder exists
      const profileFolderPath = path.join('./data/user/profilefolders', interaction.user.id);
      if (!await fileExists(profileFolderPath)) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Account Error")
              .setDescription("You don't have a linked Account to unlink")
              .setColor(config.embeds.color)
          ]
        });
      }

      // Remove the user's profile folder
      await fs.rm(profileFolderPath, { recursive: true, force: true });

      // Update the user's data to mark the account as unlinked
      if (data[interaction.user.id] && data[interaction.user.id].xbox) {
        data[interaction.user.id].xbox.linked = false;
        data[interaction.user.id].xbox.xbox = {}; // Reset the xbox info
      }
      await fs.writeFile(usersFile, JSON.stringify(data, null, 4));

      // Inform the user that unlinking was successful
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("MC Auth")
            .setDescription("Your account has been unlinked")
            .setColor(config.embeds.color)
        ],
        components: [],
      });
    } catch (error) {
      console.error("Error in unlink command:", error);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Bot Auth Error")
            .setDescription("Error while unlinking. Please contact support so we can fix this issue")
            .setColor(config.embeds.color)
        ],
        components: [],
      });
    }
  }
};
