const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require('../../data/discord/config.json');
const fs = require('fs');
const colors = require('../../data/handles/colors.js');
const path = require('path');
const { createClient } = require('bedrock-protocol');
const { dumprealm, checkaccount, getrealminfo } = require('../../men/realms');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const { Authflow, Titles } = require("prismarine-auth");
const skinData = require('../../data/skins/jenny.json');
const { reply1, reply2 } = require('../../data/discord/emojies.js');

// Status constants for embed statuses
const STATUS_OFF = "⚫";
const STATUS_WAITING = "🟡";
const STATUS_DONE = "🟢";
const STATUS_ERROR = "🔴";

// Helper: Update embed status fields
async function updateEmbed(interaction, embed, { connected, spamming, disconnected, reason }) {
  embed.setFields(
    { name: 'Connected', value: connected, inline: false },
    { name: 'Spamming', value: spamming, inline: false },
    { name: 'Disconnected', value: disconnected, inline: false },
    { name: 'Disconnected Reason', value: reason, inline: false }
  );
  await interaction.editReply({ embeds: [embed] });
}

// Helper: Cleanly disconnect a client
function disconnectClient(client) {
  if (client && typeof client.close === "function") {
    client.close();
  }
}

// Helper: Send a spam command with the provided parameters
function sendSpamCommand(sendCommand, spamType, message, request, bypass, emojie, rainbow, debug) {
  let msg = rainbow ? colorizeText(message) : message;
  if (bypass) msg += ` ${genrandomstring(8)}`;
  if (emojie) msg += ` ${emojie1(10)}`;
  let command;
  switch (spamType) {
    case 1:
      command = `/me ${msg}`;
      break;
    case 2:
      command = `/tell @a ${msg}`;
      break;
    case 4:
      command = `/msg @a ${msg}`;
      break;
    default:
      console.error('Invalid spam type');
      return;
  }
  sendCommand({
    command: command.substring(0, 512),
    origin: {
      type: request,
      uuid: "",
      request_id: uuidv4(),
    },
    internal: false,
    version: 66,
  });
  if (debug) {
    console.log(`Sent command: ${command.substring(0,512)}`);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("message")
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2)
    .setDescription("Messages the Realm with Silly Messages")
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
    .addBooleanOption(option =>
      option.setName('external')
        .setDescription('Should Message be shown as External?')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('spamtype')
        .setDescription('Type of spam')
        .setRequired(true)
        .addChoices(
          { name: 'Text', value: 0 },
          { name: '/me', value: 1 },
          { name: '/msg', value: 2 },
          { name: '/tell', value: 4 },
        ))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to Spam')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in seconds to send packets')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1000))
    .addBooleanOption(option =>
      option.setName('rainbow')
        .setDescription('Rainbow text option')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('bypass')
        .setDescription('Generates a random string behind every message')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('watermark')
        .setDescription('Will watermark your message (normally true)')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('emojie')
        .setDescription('Generates a random string of emojis behind every message')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('message2')
        .setDescription('Second message to spam')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('namespoof')
        .setDescription('Clients Name')
        .setRequired(false)
        .setMinLength(0)
        .setMaxLength(50))
    .addBooleanOption(option =>
      option.setName('debug')
        .setDescription('Enable debug logging for spam counts')
        .setRequired(false)),
  async execute(interaction) {
    try {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }

      const invite = interaction.options.getString('invite');
      const duration = interaction.options.getInteger('duration');
      const external = interaction.options.getBoolean('external');
      const message1 = interaction.options.getString('message');
      const spamType = interaction.options.getInteger('spamtype');
      const device = interaction.options.getInteger('device');
      const rainbow = interaction.options.getBoolean('rainbow') || false;
      const watermark = interaction.options.getBoolean('watermark');
      const bypass = interaction.options.getBoolean('bypass') || false;
      const emojie = interaction.options.getBoolean('emojie') || false;
      const namespoof = interaction.options.getString('namespoof') || "";
      const debug = interaction.options.getBoolean('debug') || false;
      const customMessage2 = interaction.options.getString('message2') || message1;
      const requestType = external ? 5 : 0;
      const off = STATUS_OFF;
      const waiting = STATUS_WAITING;
      const done = STATUS_DONE;
      const err1 = STATUS_ERROR;
      let disconnected = false;

      // Build initial embed
      const mainEmbed = new EmbedBuilder()
        .setTitle("Realm Spam")
        .setDescription("Loading data, this may take a few seconds depending on the workload.")
        .setColor(config.embeds.color);
      mainEmbed.setFields(
        { name: 'Connected', value: off, inline: false },
        { name: 'Spamming', value: off, inline: false },
        { name: 'Disconnected', value: off, inline: false },
        { name: 'Disconnected Reason', value: waiting, inline: false }
      );
      await interaction.editReply({ embeds: [mainEmbed] });

      // Check for linked account folder
      if (!fs.existsSync(`./data/user/profilefolders/${interaction.user.id}`)) {
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

      // Load user database (synchronously)
      const databasePath = './data/user/users.json';
      let database;
      try {
        database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
      } catch (error) {
        return interaction.editReply({
          content: 'Failed to load the database.',
          ephemeral: true,
        });
      }

      // Check whitelist
      const whitelist = JSON.parse(fs.readFileSync('./data/util/whitelist.json', 'utf8'));
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

      // Create the client instance for messaging the realm
      createClientInstance(
        interaction,
        invite,
        realm,
        spamType,
        skinData,
        namespoof,
        device,
        requestType,
        message1,
        customMessage2,
        duration,
        rainbow,
        bypass,
        emojie,
        watermark,
        debug,
        mainEmbed
      );
    } catch (err) {
      console.error(err);
    }
  }
};

function createClientInstance(interaction, invite, realm, spamType, skinData, namespoof, device, requestType, message1, customMessage2, duration, rainbow, bypass, emojie, watermark, debug, mainEmbed) {
  let inter;
  let disconnected = false;
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
    mainEmbed.setFields(
      { name: 'Connected', value: STATUS_OFF, inline: false },
      { name: 'Spamming', value: STATUS_ERROR, inline: false },
      { name: 'Disconnected', value: STATUS_ERROR, inline: false },
      { name: 'Disconnected Reason', value: `${err}`, inline: false }
    );
    interaction.editReply({ embeds: [mainEmbed] });
    disconnectClient(client);
  });

  client.on('play_status', async (packet) => {
    console.log(`${colors.green}[Realm Watcher]>> User ${interaction.user.username}/${interaction.user.id} joined Realm ${realm.name}/${invite}`);
    try {
      mainEmbed.setDescription(`${reply1}Realm Name: ${realm.name}\n${reply1}Realm ID: ${realm.id}\n${reply2}Realm IP: ${realm.ip}`);
      await updateEmbed(interaction, mainEmbed, {
        connected: STATUS_DONE,
        spamming: STATUS_WAITING,
        disconnected: STATUS_WAITING,
        reason: STATUS_WAITING
      });

      // Begin spam sending immediately
      setTimeout(() => {
        if (disconnected) return;
        updateEmbed(interaction, mainEmbed, {
          connected: STATUS_DONE,
          spamming: STATUS_WAITING,
          disconnected: STATUS_WAITING,
          reason: STATUS_WAITING
        });
        const sendCommand = (command) => {
          client.queue('command_request', command);
        };

        inter = setInterval(() => {
          if (spamType > 0) {
            // For spam types 1, 2, or 4, send commands via helper function
            for (let i = 0; i < 100; i++) {
              sendSpamCommand(sendCommand, spamType, message1, requestType, bypass, emojie, rainbow, debug);
              sendSpamCommand(sendCommand, spamType, customMessage2, requestType, bypass, emojie, rainbow, debug);
            }
          } else {
            // For spamType 0, send plain text chat messages
            for (let i = 0; i < 10; i++) {
              client.queue("text", {
                filtered_message: "",
                type: "chat",
                needs_translation: false,
                source_name: client.profile.name,
                message: message1,
                xuid: "0",
                platform_chat_id: "0"
              });
              client.queue("text", {
                filtered_message: "",
                type: "chat",
                needs_translation: false,
                source_name: client.profile.name,
                message: customMessage2,
                xuid: "0",
                platform_chat_id: "0"
              });
            }
          }
        }, 0);
      }, 0);

      // End spam after the specified duration
      setTimeout(() => {
        if (!disconnected) {
          clearInterval(inter);
          disconnectClient(client);
          updateEmbed(interaction, mainEmbed, {
            connected: STATUS_DONE,
            spamming: STATUS_DONE,
            disconnected: STATUS_DONE,
            reason: STATUS_WAITING
          });
          disconnected = true;
        }
      }, duration * 1000);
    } catch (error) {
      console.error(error);
      disconnectClient(client);
    }

    // Force disconnection after an extra delay
    setTimeout(() => {
      for (let i = 1; i <= 6; i++) {
        disconnectClient(client);
      }
    }, duration * 1000 + 3000);
  });

  client.on('start_game', async (packet) => {
    inter = setInterval(() => {
      if (spamType === 0) {
        for (let i = 0; i < 10; i++) {
          client.queue("text", {
            filtered_message: "",
            type: "chat",
            needs_translation: false,
            source_name: client.profile.name,
            message: message1,
            xuid: "0",
            platform_chat_id: "0"
          });
          client.queue("text", {
            filtered_message: "",
            type: "chat",
            needs_translation: false,
            source_name: client.profile.name,
            message: customMessage2,
            xuid: "0",
            platform_chat_id: "0"
          });
        }
      } else {
        // Additional handling for other spam types if needed.
      }
    }, 0);
  });

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
    "disconnectionScreen.worldCorruption": "The world on this realm is corrupted, Unable to Join",
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
    console.log(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.red} Client Kicked from the Realm. ${realm.id}/${realm.name}. ${parseKickMessage(reason.message)}`);
    mainEmbed.setFields(
      { name: 'Connected', value: STATUS_OFF, inline: false },
      { name: 'Spamming', value: STATUS_ERROR, inline: false },
      { name: 'Disconnected', value: STATUS_ERROR, inline: false },
      { name: 'Disconnected Reason', value: parseKickMessage(reason.message), inline: false }
    );
    interaction.editReply({ embeds: [mainEmbed] });
  });

  client.on('close', async (err) => {
    if (!err) return;
    if (disconnected) return;
    disconnected = true;
    console.log(`${colors.blue}[${new Date().toLocaleTimeString()}]${colors.red} Client closed Connection from the Realm. ${realm.id}/${realm.name}.`);
    mainEmbed.setFields(
      { name: 'Connected', value: STATUS_OFF, inline: false },
      { name: 'Spamming', value: STATUS_ERROR, inline: false },
      { name: 'Disconnected', value: STATUS_ERROR, inline: false },
      { name: 'Disconnected Reason', value: parseKickMessage(err.message || "N/A"), inline: false }
    );
    interaction.editReply({ embeds: [mainEmbed] });
  });
}

function colorizeText(text) {
  const words = text.split(' ');
  const coloredWords = words.map(word => {
    const colorCode = randomCode();
    return `${colorCode}${word}`;
  });
  return coloredWords.join(' ');
}

function rainbowText(text) {
  const colorsArr = ['§c', '§6', '§e', '§a', '§b', '§9', '§d', '§f'];
  let rainbowedText = '';
  for (let i = 0; i < text.length; i++) {
    rainbowedText += colorsArr[i % colorsArr.length] + text[i];
  }
  return rainbowedText;
}

function randomCode() {
  const optionsString = "1234567890";
  const optionsArray = optionsString.split('');
  const randomIndex = Math.floor(Math.random() * optionsArray.length);
  const randomOption = optionsArray[randomIndex];
  return "§" + randomOption;
}

function emojie1(length) {
  const characters = '';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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
  // Note: uuidv5 is referenced but not imported; if needed, import and use accordingly.
  const getUUIDv5 = () => uuidv3(uuidv4(), NIL);
  switch (deviceOS) {
    case 1:
      return uuidv4().replace(/-/g, "");
    case 2:
      return uuidv4().replace(/-/g, "").toUpperCase();
    case 7:
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
