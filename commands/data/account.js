const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require('../../data/discord/config.json');
const fs = require('node:fs').promises;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("account")
    .setDescription("View your linked accounts")
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2),
  async execute(interaction) {
    const userId = interaction.user.id;

    // Read and parse the user data asynchronously.
    let data;
    try {
      const fileData = await fs.readFile('./data/user/users.json', 'utf8');
      data = JSON.parse(fileData);
    } catch (error) {
      console.error("Error reading user data:", error);
      return interaction.reply({ content: "There was an error reading your data.", ephemeral: true });
    }

    if (!data[userId]) {
      return interaction.reply({ content: "No data found for your account.", ephemeral: true });
    }

    const userData = data[userId];
    const ranlsData = userData.ranls || {};

    // Create a clean, formatted JSON object for ranls data.
    const formattedranlsData = {
      "ranls Money": ranlsData.money ?? "0",
      "Commands Used": ranlsData.cmds ?? "N/A",
      "Beta Tester": ranlsData.betatester ?? "N/A",
      "Staff": ranlsData.staff ?? "N/A",
      "Premium": ranlsData.premium ?? "N/A",
      "Premium Time": ranlsData.premiumtime ?? "0",
      "Nuke Stats": {
        "Realm Crashes": ranlsData.realmCrashes ?? "0",
        "Realm Nukes": ranlsData.realmNukes ?? "0",
        "Honeypot Flagges": ranlsData.honeypotFlagges ?? "N/A"
      }
    };

    const globalEmbed = new EmbedBuilder()
      .setTitle("Your Account Overview")
      .setDescription(`\`\`\`json\n${JSON.stringify(formattedranlsData, null, 2)}\n\`\`\``)
      .setColor(config.embeds.color);

    await interaction.reply({ embeds: [globalEmbed], ephemeral: true });

    // Process Xbox account info if available.
    const xboxData = userData.xbox || { linked: false };

    const xboxFormattedData = {
      "Linked": xboxData.linked ? "True" : "False",
      "XUID": xboxData.linked ? (xboxData.xuid || "N/A") : "N/A",
      "GamerTag": xboxData.linked ? (xboxData.gamertag || "N/A") : "N/A",
      "Gamer Score": xboxData.linked ? (xboxData.gamerScore || "N/A") : "N/A",
      "Reputation": xboxData.linked ? (xboxData.xboxOneRep || "N/A") : "N/A"
    };

    const xboxEmbed = new EmbedBuilder()
      .setTitle("Account: Xbox")
      .setDescription(`\`\`\`json\n${JSON.stringify(xboxFormattedData, null, 2)}\n\`\`\``)
      .setColor(config.embeds.color);

    await interaction.followUp({ embeds: [xboxEmbed], ephemeral: true });
  }
};
