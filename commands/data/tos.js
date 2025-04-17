const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("node:fs").promises;
const config = require('../../data/discord/config.json');

// Helper to check if a file exists
async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tos")
    .setDescription("Agree to the TOS and start using commands."),
  execute: async (interaction) => {
    try {
      // Send an initial reply to check TOS acceptance.
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("RANLS TOS")
            .setDescription("Checking if you have already accepted the TOS...")
            .setColor(config.embeds.color),
        ],
        ephemeral: true,
      });

      // Load user data from file.
      let data = {};
      const usersPath = './data/user/users.json';
      if (await fileExists(usersPath)) {
        const fileData = await fs.readFile(usersPath, 'utf8');
        data = JSON.parse(fileData);
      }

      // If the user has already accepted the TOS, inform and exit.
      if (data[interaction.user.id]?.tos) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("RANLS TOS")
              .setDescription("You have already accepted the TOS. Use `/link` to get started!")
              .setColor(config.embeds.color),
          ],
          ephemeral: true,
        });
        return;
      }

      // Inform user about TOS details.
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("RANLS TOS")
            .setDescription(
              "By agreeing, you accept all responsibility for using ranls, including spam or other actions. RANLS and its developers are not liable for your actions."
            )
            .setColor(config.embeds.color),
        ],
        components: [],
        ephemeral: true,
      });

      // Create the "Agree to TOS" button.
      const tosButton = new ButtonBuilder()
        .setCustomId('agree_tos')
        .setLabel('Agree to TOS')
        .setStyle(ButtonStyle.Success);

      const buttonRow = new ActionRowBuilder().addComponents(tosButton);

      // Edit reply to include the button.
      const message = await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("RANLS TOS")
            .setDescription("Please click the button below to agree to the TOS.")
            .setColor(config.embeds.color),
        ],
        components: [buttonRow],
        ephemeral: true,
      });

      // Create a collector to await the button click.
      const filter = (i) => i.customId === 'agree_tos' && i.user.id === interaction.user.id;
      try {
        const btnInteraction = await message.awaitMessageComponent({ filter, time: 60000 });

        // Mark TOS as accepted in the data.
        data[interaction.user.id] = { ...(data[interaction.user.id] || {}), tos: true };
        await fs.writeFile(usersPath, JSON.stringify(data, null, 2));

        await btnInteraction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("RANLS TOS")
              .setDescription("You have agreed to the TOS and can now start using RANLS.")
              .setColor(config.embeds.color),
          ],
          components: [],
        });
      } catch (collectorError) {
        // Handle timeout or cancellation.
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("RANLS TOS")
              .setDescription("You did not respond in time. Please run the command again to agree to the TOS.")
              .setColor(config.embeds.color),
          ],
          components: [],
        });
      }
    } catch (error) {
      console.error("Error in TOS command:", error);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("An error occurred while processing your request. Please try again later.")
            .setColor(config.embeds.color),
        ],
        ephemeral: true,
      });
    }
  },
};
