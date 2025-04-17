const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require('../../data/discord/config.json');
const fs = require("node:fs").promises;
const colors = require('../../data/handles/colors.js');
const path = require('path');
const { createClient } = require('bedrock-protocol');
const { dumprealm, checkaccount, getrealminfo } = require('../../men/realms');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const { reply1, reply2 } = require('../../data/discord/emojies.js');
const skinData = require('../../data/skins/jenny.json');

// Helper function to check if a file or folder exists
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
    .setName("coords")
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2)
    .setDescription("Lag the Realm with different modes")
    .addStringOption(option =>
      option.setName('invite')
        .setDescription('Realm invite code or Realm ID')
        .setRequired(true)
        .setMinLength(8)
        .setMaxLength(15))
    .addStringOption(option =>
      option.setName('namespoof')
        .setDescription('Clients Name')
        .setRequired(false)
        .setMinLength(8)
        .setMaxLength(15)),
  async execute(interaction) {
    try {
      const invite = interaction.options.getString('invite');
      const namespoof = interaction.options.getString('namespoof');
      const mode = interaction.options.getInteger('mode');
      const dupe_client = interaction.options.getBoolean('dupe_client') || false;
      const playername = interaction.options.getString('playername') || interaction.user.username;
      const duration = interaction.options.getInteger('duration');
      let disconnected = false;
      const off = "⚫";
      const waiting = "🟡";
      const done = "🟢";
      const err1 = "🔴";

      // Create initial embed and reply
      const main = new EmbedBuilder()
        .setTitle("Realm Coords")
        .setDescription("Loading data, this may take a few seconds depending on the workload.")
        .addFields(
          { name: 'Connected', value: off, inline: false },
          { name: 'E', value: off, inline: false },
          { name: 'Disconnected', value: off, inline: false },
          { name: 'Disconnected Reason', value: waiting, inline: false }
        )
        .setColor(config.embeds.color);

      await interaction.reply({ embeds: [main] });

      // Load the user database
      const databasePath = './data/user/users.json';
      let database;
      try {
        if (!(await fileExists(databasePath))) {
          return interaction.editReply({
            content: 'Database file not found.',
            ephemeral: true,
          });
        }
        const dbData = await fs.readFile(databasePath, 'utf8');
        database = JSON.parse(dbData);
      } catch (error) {
        return interaction.editReply({
          content: 'Failed to load the database.',
          ephemeral: true,
        });
      }

      // Check if the user has a linked account by verifying the profile folder exists
      const profileFolderPath = path.join('./data/user/profilefolders', interaction.user.id);
      if (!(await fileExists(profileFolderPath))) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Account Not Linked')
              .setDescription('It seems like you haven\'t linked an account yet.\nPlease link an account with \'/link\' to use this command.')
              .setColor(0xff0000)
          ]
        });
        return;
      }

      // Load the whitelist file
      let whitelist = [];
      try {
        const whitelistPath = './data/util/whitelist.json';
        if (await fileExists(whitelistPath)) {
          const whitelistData = await fs.readFile(whitelistPath, 'utf8');
          whitelist = JSON.parse(whitelistData);
        }
      } catch (error) {
        console.error("Error loading whitelist:", error);
      }
      if (whitelist.includes(invite)) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Realm Error')
              .setDescription(`The invite ${invite} is in the whitelist and cannot be lagged.`)
              .setColor(config.embeds.color)
          ]
        });
      }

      // Get realm information
      const realm = await getrealminfo(invite);
      if (!realm) {
        console.error(`[${new Date().toLocaleTimeString()}] Error: Realm not found`);
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Realm Error')
              .setDescription('Invalid code: realm not found or account banned.')
              .setColor(config.embeds.color)
          ]
        });
      }

      // Create the Bedrock client using the provided invite and skin data
      const client = createClient({
        profilesFolder: profileFolderPath,
        username: interaction.user.id,
        offline: false,
        realms: {
          ...(invite.length === 8
            ? { realmId: invite }
            : { realmInvite: invite })
        },
        skinData: {
          DeviceOS: 7, // Windows 10 (x64)
          DeviceId: getDeviceId(7),
          PlatformOnlineId: genrandomstring(19, '1234567890'),
          PrimaryUser: false,
          SelfSignedId: uuidv4(),
          ThirdPartyName: namespoof,
          ThirdPartyNameOnly: true,
          TrustedSkin: true,
          ...skinData
        },
        skipPing: true
      });

      client.on('server_stats', async (err) => {
        console.error(`${colors.blue}[${new Date().toLocaleTimeString()}]${colors.yellow} Buggy Packet Received: ${err.message || err}`);
      });

      client.on('error', async (err) => {
        console.error(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.yellow} Client error: ${err.message || err}`);
        main.setDescription("Wops! There was an error while Trying to join the Realm");
        main.setFields(
          { name: 'Connected', value: off, inline: false },
          { name: 'Lagging', value: err1, inline: false },
          { name: 'Disconnected', value: err1, inline: false },
          { name: 'Disconnected Reason', value: `${err}`, inline: false }
        );
        interaction.editReply({ embeds: [main] });
        return;
      });

      client.on('start_game', async (packet) => {
        const { x, y, z } = packet.player_position;
        console.log(`${colors.green}[Realm Watcher]>> User ${interaction.user.username}/${interaction.user.id} joined Realm ${realm.name}/${invite}`);
        try {
          main.setDescription(`${reply1}Realm Name:${realm.name}\n${reply1}Realm ID:${realm.id}\n${reply2}Realm IP:${realm.ip}`);
          main.setFields(
            { name: 'Connected', value: done, inline: false },
            { name: 'E', value: waiting, inline: false },
            { name: 'Disconnected', value: waiting, inline: false },
            { name: 'Disconnected Reason', value: waiting, inline: false }
          );
          interaction.editReply({ embeds: [main] });

          main.setDescription(`X= ${x}\nY= ${y}\nZ= ${z}`);
          interaction.editReply({ embeds: [main] });

          setTimeout(() => {
            if (disconnected) return;
            main.setFields(
              { name: 'Connected', value: done, inline: false },
              { name: 'E', value: done, inline: false },
              { name: 'Disconnected', value: waiting, inline: false },
              { name: 'Disconnected Reason', value: waiting, inline: false }
            );
            interaction.editReply({ embeds: [main] });
          }, 0);

          setTimeout(() => {
            if (!disconnected) {
              client.close();
              main.setFields(
                { name: 'Connected', value: done, inline: false },
                { name: 'E', value: done, inline: false },
                { name: 'Disconnected', value: done, inline: false },
                { name: 'Disconnected Reason', value: waiting, inline: false }
              );
              interaction.editReply({ embeds: [main] });
              disconnected = true;
            }
          }, 1000);
        } catch (error) {
          console.error(error);
          throw error;
        }
      });

      const e = {
        "disconnectionScreen.noReason": "You have been disconnected from the Realm because of sending too many packets",
        "disconnection.kicked.reason": "You have been Kicked From the Realm",
        "disconnection.kicked": "You have been Kicked From the Realm",
        "disconnectionScreen.outdatedClient": "The Realm is outdated!",
        "disconnectionScreen.disconnected": "Disconnected from the Realm",
        "disconnectionScreen.serverFull": "Realm is Currently Full",
        "disconnectionScreen.notAllowed": "Something didn't go right, try to use a less longer NameSpoof Name. (notAllowed)",
        "disconnectionScreen.serverIdConflict": "Client already in this Realm. Leave with the Account or wait until your Interaction is done",
        "disconnectionScreen.loggedinOtherLocation": "Client already in this Realm. Leave with the Account or wait until your Interaction is done",
        "disconnectionScreen.worldCorruption": "The world on this realm is corrupted, Unable to Join",
        "disconnect.scriptWatchdog": "The realm was shut down due to an unhandled scripting watchdog exception.",
        "disconnect.scriptWatchdogOutOfMemory": "The realm was shut down because of scripting memory limit."
      };

      function parseKickMessage(error) {
        for (const key in e) {
          error = error.replace(key, e[key]);
        }
        return error;
      }

      client.on('kick', async (reason) => {
        console.log(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.red} Client Kicked from the Realm. ${realm.id}/${realm.name}. ${parseKickMessage(reason.message)}`);
        main.setFields(
          { name: 'Connected', value: off, inline: false },
          { name: 'Lagging', value: err1, inline: false },
          { name: 'Disconnected', value: err1, inline: false },
          { name: 'Disconnected Reason', value: parseKickMessage(reason.message), inline: false }
        );
        interaction.editReply({ embeds: [main] });
      });

      client.on('close', async (err) => {
        if (!err) {
          return "N/A";
        }
        if (disconnected) return;
        disconnected = true;
        console.log(`${colors.blue}[${new Date().toLocaleTimeString()}]${colors.red}Client closed Connection from the Realm. ${realm.id}/${realm.name}.`);
        main.setFields(
          { name: 'Connected', value: off, inline: false },
          { name: 'Lagging', value: err1, inline: false },
          { name: 'Disconnected', value: err1, inline: false },
          { name: 'Disconnected Reason', value: parseKickMessage(err.message || "N/A"), inline: false }
        );
        interaction.editReply({ embeds: [main] });
      });

    } catch (err) {
      console.error(err);
    }
  }
};

function genrandomstring(length, charSet) {
  if (!charSet) charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charSet.charAt(Math.floor(Math.random() * charSet.length));
  }
  return result;
}

function getDeviceId(deviceOS) {
  const getUUIDv3 = () => uuidv3(uuidv4(), NIL);
  const getUUIDv5 = () => require('uuid').v5(uuidv4(), NIL);
  switch (deviceOS) {
    // Android
    case 1:
      return uuidv4().replace(/-/g, "");
    // iOS
    case 2:
      return uuidv4().replace(/-/g, "").toUpperCase();
    // Windows (x86)
    case 7:
      return getUUIDv3();
    // Windows (x64)
    case 8:
      return getUUIDv3();
    // Playstation
    case 11:
      return getUUIDv3();
    // Nintendo Switch
    case 12:
      return getUUIDv5();
    // Xbox
    case 13:
      return genrandomstring(44, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890/=+");
    default:
      return uuidv4();
  }
}
