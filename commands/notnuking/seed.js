const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs").promises;
const path = require("path");
const config = require('../../data/discord/config.json');
const colors = require('../../data/handles/colors.js');
const { createClient } = require('bedrock-protocol');
const { dumprealm, checkaccount, getrealminfo } = require('../../men/realms');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const skinData = require('../../data/skins/jenny.json');
const { reply1, reply2 } = require('../../data/discord/emojies.js');

// Helper to check existence of files or folders
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
    .setName("seed")
    .setDescription("Lag the Realm with different modes")
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2)
    .addStringOption(opt =>
      opt.setName('invite')
        .setDescription('Realm invite code or Realm ID')
        .setRequired(true)
        .setMinLength(8)
        .setMaxLength(15))
    .addStringOption(opt =>
      opt.setName('namespoof')
        .setDescription('Client’s name override')
        .setRequired(false)
        .setMinLength(1)
        .setMaxLength(16)),
  async execute(interaction) {
    const invite = interaction.options.getString('invite');
    const namespoof = interaction.options.getString('namespoof') || null;
    let disconnected = false;

    // Status icons
    const off = "⚫", waiting = "🟡", done = "🟢", err1 = "🔴";

    // Initial “loading” embed
    const main = new EmbedBuilder()
      .setTitle("Realm Seed")
      .setDescription("Loading data, this may take a few seconds depending on workload.")
      .addFields(
        { name: 'Connected', value: off },
        { name: 'Seed Fetched', value: off },
        { name: 'Disconnected', value: off },
        { name: 'Reason', value: waiting }
      )
      .setColor(config.embeds.color);

    await interaction.reply({ embeds: [main] });

    try {
      // 1) Verify user has linked profile folder
      const profileFolder = path.join('./data/user/profilefolders', interaction.user.id);
      if (!await fileExists(profileFolder)) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Account Not Linked")
              .setDescription("You haven’t linked an account yet. Use `/link` first.")
              .setColor(0xff0000)
          ]
        });
      }

      // 2) Load & check whitelist
      let whitelist = [];
      const wlPath = './data/util/whitelist.json';
      if (await fileExists(wlPath)) {
        const wlRaw = await fs.readFile(wlPath, 'utf8');
        whitelist = JSON.parse(wlRaw);
      }
      if (whitelist.includes(invite)) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Realm Error")
              .setDescription(`Invite \`${invite}\` is whitelisted and cannot be lagged.`)
              .setColor(config.embeds.color)
          ]
        });
      }

      // 3) Fetch realm info
      const realm = await getrealminfo(invite);
      if (!realm) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Realm Error")
              .setDescription("Invalid code: realm not found or banned.")
              .setColor(config.embeds.color)
          ]
        });
      }

      // 4) Create Bedrock client
      const client = createClient({
        profilesFolder: profileFolder,
        username: interaction.user.id,
        offline: false,
        realms: invite.length === 8
          ? { realmId: invite }
          : { realmInvite: invite },
        skinData: {
          DeviceOS: 7, // Windows 10 x64
          DeviceId: getDeviceId(7),
          PlatformOnlineId: genrandomstring(19, '1234567890'),
          PrimaryUser: false,
          SelfSignedId: uuidv4(),
          ThirdPartyName: namespoof,
          ThirdPartyNameOnly: !!namespoof,
          TrustedSkin: true,
          ...skinData
        },
        skipPing: true
      });

      // Event: protocol/server stats (errors only)
      client.on('server_stats', (err) => {
        console.error(`${colors.blue}[${new Date().toLocaleTimeString()}]${colors.yellow} Packet Error: ${err.message}`);  
      });

      // Event: connection error
      client.on('error', (err) => {
        console.error(`${colors.blue}[${new Date().toLocaleTimeString()}]${colors.red} Client error: ${err.message}`);
        main
          .setDescription("Failed to join the realm.")
          .setFields(
            { name: 'Connected', value: off },
            { name: 'Seed Fetched', value: err1 },
            { name: 'Disconnected', value: err1 },
            { name: 'Reason', value: err.message }
          );
        interaction.editReply({ embeds: [main] });
      });

      // Event: when the client has joined and received seed
      client.on('start_game', (packet) => {
        const seed = packet.seed;
        console.log(`${colors.green}[Seed]>> User ${interaction.user.tag} joined realm ${realm.name}/${invite}`);

        // Update embed with realm info
        main
          .setDescription(
            `${reply1}Realm Name: ${realm.name}\n` +
            `${reply1}Realm ID: ${realm.id}\n` +
            `${reply2}Realm IP: ${realm.ip}`
          )
          .setFields(
            { name: 'Connected', value: done },
            { name: 'Seed Fetched', value: waiting },
            { name: 'Disconnected', value: waiting },
            { name: 'Reason', value: waiting }
          );
        interaction.editReply({ embeds: [main] });

        // Show seed
        main.setDescription(`${reply1} Seed: \`${seed}\``);
        main.setFields(
          { name: 'Connected', value: done },
          { name: 'Seed Fetched', value: done },
          { name: 'Disconnected', value: waiting },
          { name: 'Reason', value: waiting }
        );
        interaction.editReply({ embeds: [main] });

        // After 1s, disconnect
        setTimeout(() => {
          if (!disconnected) {
            disconnected = true;
            client.close();
            main.setFields(
              { name: 'Connected', value: done },
              { name: 'Seed Fetched', value: done },
              { name: 'Disconnected', value: done },
              { name: 'Reason', value: waiting }
            );
            interaction.editReply({ embeds: [main] });
          }
        }, 1000);
      });

      // Event: kicked
      client.on('kick', (reason) => {
        const msg = parseKickMessage(reason.message);
        console.log(`${colors.red}[KICKED] ${msg}`);
        main.setFields(
          { name: 'Connected', value: off },
          { name: 'Seed Fetched', value: err1 },
          { name: 'Disconnected', value: err1 },
          { name: 'Reason', value: msg }
        );
        interaction.editReply({ embeds: [main] });
      });

      // Event: close
      client.on('close', (err) => {
        if (disconnected) return;
        disconnected = true;
        const reason = err ? parseKickMessage(err.message) : "Closed cleanly";
        main.setFields(
          { name: 'Connected', value: off },
          { name: 'Seed Fetched', value: err1 },
          { name: 'Disconnected', value: err1 },
          { name: 'Reason', value: reason }
        );
        interaction.editReply({ embeds: [main] });
      });

    } catch (error) {
      console.error("Error in /seed:", error);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("An unexpected error occurred. Please try again later.")
            .setColor(0xff0000)
        ]
      });
    }
  }
};

// Utility: parse raw disconnect messages
function parseKickMessage(msg) {
  const map = {
    "disconnectionScreen.noReason": "Disconnected: too many packets",
    "disconnection.kicked.reason": "Kicked from realm",
    "disconnectionScreen.outdatedClient": "Realm is outdated",
    // …add more mappings as needed
  };
  for (const key in map) msg = msg.replace(key, map[key]);
  return msg;
}

// Utility: random string generator
function genrandomstring(len, chars) {
  chars = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  return Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

// Utility: generate device ID per Bedrock spec
function getDeviceId(deviceOS) {
  const getUUIDv3 = () => uuidv3(uuidv4(), NIL);
  const getUUIDv5 = () => require('uuid').v5(uuidv4(), NIL);
  switch (deviceOS) {
    case 1: return uuidv4().replace(/-/g, "");
    case 2: return uuidv4().replace(/-/g, "").toUpperCase();
    case 7: case 8: case 11: return getUUIDv3();
    case 12: return getUUIDv5();
    case 13: return genrandomstring(44, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/=+");
    default: return uuidv4();
  }
}
