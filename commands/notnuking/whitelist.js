const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs").promises;
const path = require("path");
const config = require('../../data/discord/config.json');

// Helper: check file/folder existence
async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Manage the realm invite whitelist (staff only)")
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Add an invite code to the whitelist")
        .addStringOption(opt =>
          opt.setName("invite")
            .setDescription("Realm invite code or ID")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove an invite code from the whitelist")
        .addStringOption(opt =>
          opt.setName("invite")
            .setDescription("Realm invite code or ID")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("list")
        .setDescription("Show all whitelisted invite codes")
    ),
  async execute(interaction) {
    const userId = interaction.user.id;
    const usersPath = './data/user/users.json';
    const wlPath = './data/util/whitelist.json';

    // 1) Load user data to check staff status
    let users = {};
    if (await fileExists(usersPath)) {
      users = JSON.parse(await fs.readFile(usersPath, 'utf8'));
    }
    const userData = users[userId] || {};
    const isStaff = userData.ranls?.staff && userData.ranls.staff !== "N/A";

    if (!isStaff) {
      return interaction.reply({
        content: "❌ You do not have permission to manage the whitelist.",
        ephemeral: true
      });
    }

    // 2) Load (or initialize) the whitelist array
    let whitelist = [];
    if (await fileExists(wlPath)) {
      whitelist = JSON.parse(await fs.readFile(wlPath, 'utf8'));
    }

    const sub = interaction.options.getSubcommand();
    const code = interaction.options.getString("invite");

    try {
      if (sub === "add") {
        if (whitelist.includes(code)) {
          return interaction.reply({ content: `🔹 \`${code}\` is already whitelisted.`, ephemeral: true });
        }
        whitelist.push(code);
        await fs.writeFile(wlPath, JSON.stringify(whitelist, null, 2));
        return interaction.reply({ content: `✅ Added \`${code}\` to the whitelist.`, ephemeral: true });
      }

      if (sub === "remove") {
        if (!whitelist.includes(code)) {
          return interaction.reply({ content: `⚠️ \`${code}\` was not found in the whitelist.`, ephemeral: true });
        }
        whitelist = whitelist.filter(i => i !== code);
        await fs.writeFile(wlPath, JSON.stringify(whitelist, null, 2));
        return interaction.reply({ content: `✅ Removed \`${code}\` from the whitelist.`, ephemeral: true });
      }

      // sub === "list"
      if (whitelist.length === 0) {
        return interaction.reply({ content: "📋 Whitelist is currently empty.", ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setTitle("Realm Invite Whitelist")
        .setDescription(whitelist.map(i => `• ${i}`).join("\n"))
        .setColor(config.embeds.color);
      return interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (err) {
      console.error("Whitelist command error:", err);
      return interaction.reply({
        content: "❌ An error occurred while updating the whitelist. Please try again later.",
        ephemeral: true
      });
    }
  }
};
