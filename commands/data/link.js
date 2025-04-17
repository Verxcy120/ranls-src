const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Authflow, Titles } = require("prismarine-auth");
const crypto = require("node:crypto");
const fs = require("node:fs");
const axios = require("axios");
const axl = require("app-xbox-live");
const config = require('../../data/discord/config.json')
const curve = "secp384r1";
let data = {};
const webhookUrl = "https://discord.com/api/webhooks/1358568701426929735/Mzjj4pClb8q81-iuYl09-qLU-fAmyBtwM7h88ZsxN12jOPlPFgGmlJiRXSlgQFpzT3TZ" // TODO: change this to channel ID
const { loading } = require('../../data/discord/emojies')
module.exports = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Link your Discord account to your Minecraft account.")
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2),
    execute: async (interaction) => {

        try {              
            if (fs.existsSync('./data/user/users.json')) { 
                let data = JSON.parse(fs.readFileSync('./data/user/users.json', 'utf8'));
            
                if (data[interaction.user.id].linked && fs.existsSync(`./data/user/profilefolders/${interaction.user.id}`)) {
                    const unlinkbuttton = new ButtonBuilder()
                        .setCustomId('unlink')
                        .setLabel('Unlink Account')
                        .setStyle(ButtonStyle.Danger);
            
                    const row = new ActionRowBuilder().addComponents(unlinkbuttton);
            
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Error")
                                .setDescription(`Your account has already been linked to ${data[interaction.user.id].xbox.gamertag}, would you like to unlink this account?`)
                                .setColor(config.embeds.color),
                        ],
                        components: [row],
                    });
            
                    interaction.client.on('interactionCreate', async (buttonInteraction) => {
                        if (!buttonInteraction.isButton()) return;
                        if (buttonInteraction.customId !== 'unlink') return;
                        if (buttonInteraction.user.id !== interaction.user.id) {
                            return await buttonInteraction.reply({ content: "You cannot use this button.", ephemeral: true }); 
                        }
            
            
                        if (fs.existsSync(`./data/user/profilefolders/${interaction.user.id}`)) {
                            fs.rmSync(`./data/user/profilefolders/${interaction.user.id}`, { recursive: true, force: true });
                        }
            
                        data[interaction.user.id].linked = false;
            
                        fs.writeFileSync('./data/user/users.json', JSON.stringify(data, null, 2));
            
                        await buttonInteraction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Unlinked")
                                    .setDescription("Your account has been unlinked")
                                    .setColor(config.embeds.color)
                            ],
                            components: [],
                        });
                    });
            
                    return;
                } else {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Auth Error")
                                .setDescription(`You have not linked your Account Yet`)
                                .setColor(config.embeds.color)
                        ],
                        ephemeral: true,
                        components: []
                    });
                }
            }
    
            const client = new Authflow(interaction.user.id, `./data/user/profilefolders/${interaction.user.id}`, {
                flow: "live",
                authTitle: Titles.MinecraftNintendoSwitch,
                deviceType: "Nintendo",
                doSisuAuth: true
            }, async (code) => {
                try{
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("MC Auth")
                            .setDescription(`To auth/link your xbox visit ${code.verification_uri}?otc=${code.user_code} and enter the code \`${code.user_code}\` \nYou have 5 min until the Code Expires\n**Do NOT link your Main Account**`)
                            .setColor(config.embeds.color)
                    ],
                    ephemeral: true,
                    components: [ 
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel('Fast Link')
                                .setStyle(ButtonStyle.Link)
                                .setURL(`http://microsoft.com/link?otc=${code.user_code ?? "unknown"}`)
                        )
                    ]
                });
            } catch (error) {
                console.log(error)
            }
            });

            let expired = false;
            await Promise.race([
                client.getXboxToken(),
                new Promise((resolve) =>
                    setTimeout(() => {
                        expired = true;
                        resolve();
                    }, 1000 * 60 * 5)
                ),
            ]);

            if (expired){
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Auth Timeout")
                            .setDescription(`The Code has expired. Rerun the Command.`)
                            .setColor(config.embeds.color)
                    ],
                    components: [],
                });
            }
    
            interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Logging in")
                        .setDescription(`Signed into xbox, starting to fetch details. This may take a few seconds`)
                        .setColor(config.embeds.color)
                        
                ],
                components: [],
            })

            const keypair = crypto.generateKeyPairSync("ec", { namedCurve: curve }).toString("base64");
            const xbl = await client.getXboxToken("rp://playfabapi.com/");
            const info = await client.getXboxToken();
            const xl = new axl.Account(`XBL3.0 x=${info.userHash};${info.XSTSToken}`);
            const result = await xl.people.get(info.userXUID);

            if (!result || !Array.isArray(result.people)) {
                throw new Error("Failed to retrieve Xbox account information.");
            }

            try {
                await client.getMinecraftBedrockToken(keypair);
            } catch (authError) {
                console.log(`Minecraft authentication failed: ${authError.message}`)
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Linking Error")
                            .setDescription(
                                `An error occurred during the linking process \n${authError.message}`
                            )
                            .setColor(0xff0000),
                    ],
                    ephemeral: true,
                });
                await VerifyAccount(`XBL3.0 x=${xbl.userHash};${xbl.XSTSToken}`);
                await client.getMinecraftBedrockToken(keypair);
            }

            if (fs.existsSync('./data/user/users.json')) {
                    data = JSON.parse(fs.readFileSync('./data/user/users.json', 'utf8'));
                }
            
                data[interaction.user.id].xbox = {
                    linked: true,
                    xbox: result.people[0],
                    info,
                };

                const newLinkEntry = {
                    gamertag: result.people[0].gamertag,
                    xuid: result.people[0].xuid,
                    gamerscore: result.people[0].gamerScore,
                    time: new Date().toISOString(),
                };
                
                if (!Array.isArray(data[interaction.user.id].linkHistory)) {
                    data[interaction.user.id].linkHistory = []; 
                }
                data[interaction.user.id].linkHistory.push(newLinkEntry);

                const e = [`{\n
"GamerTag": "${result.people[0].gamertag}"
"XUID": "${result.people[0].xuid}"
"Gamer Score": "${result.people[0].gamerScore}"                    
                    \n}`]

                fs.writeFileSync('./data/user/users.json', JSON.stringify(data, null, 4));
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Auth Sussesfully")
                            .setDescription(`You have linked your Account sussesfully.\nAccount Info:`+ `\`\`\`json\n${e}\n\`\`\``)
                            .setColor(config.embeds.color)
                    ],
                    components: [],
                });
                await axios.post(webhookUrl, {
                    embeds: [
                        {   username: "Test",
                            title: "New Acc Linked",
                            description: `User : ${interaction.user.tag}/${interaction.user.id} has linked to the Bot with :\n${result.people[0].gamertag}\nGamer Score: ${result.people[0].gamerScore}\n XUID: ${result.people[0].xuid}`,
                        },
                    ],
                });
        } catch (error) {
            console.log(error)
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Bot Error")
                        .setDescription(`There was a problem. Please try again later.\nError: ${error}`)
                        .setColor(config.embeds.color)
                ],
                components: [],
            });

        }
    },
};

/**
 * @name VerifyAccount
 * @param {string} XBL3 - Xbox Live Token
 * @returns {Promise<{XEntityToken: string, PlayFabId: string}>}
 * @remarks Verifies the XBOX Live Token with Minecraft.
 */

const VerifyAccount = async (XBL3) =>
    new Promise(async (resolve, reject) => {
        try {
            console.log(XBL3);
            const myHeaders = new Headers();
            myHeaders.append("Cache-Control", "no-cache");
            myHeaders.append("Accept", "application/json");
            myHeaders.append("Accept-Language", "en-CA,en;q=0.5");
            myHeaders.append("User-Agent", "ibhttpclient/1.0.0.0");
            myHeaders.append("content-type", "application/json; charset=utf-8");
            myHeaders.append("x-playfabsdk", "XPlatCppSdk-3.6.190304");
            myHeaders.append("x-reporterrorassuccess", "true");
            myHeaders.append("Connection", "Keep-Alive");
            myHeaders.append("Host", "20ca2.playfabapi.com");

            const raw = JSON.stringify({
                CreateAccount: true,
                EncryptedRequest: null,
                InfoRequestParameters: {
                    GetCharacterInventories: false,
                    GetCharacterList: false,
                    GetPlayerProfile: true,
                    GetPlayerStatistics: false,
                    GetTitleData: false,
                    GetUserAccountInfo: true,
                    GetUserData: false,
                    GetUserInventory: false,
                    GetUserReadOnlyData: false,
                    GetUserVirtualCurrency: false,
                    PlayerStatisticNames: null,
                    ProfileConstraints: null,
                    TitleDataKeys: null,
                    UserDataKeys: null,
                    UserReadOnlyDataKeys: null,
                },
                PlayerSecret: null,
                TitleId: "20CA2",
                XboxToken: XBL3,
            }, null, 2);

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            const BaseEntity = await (await fetch("https://20ca2.playfabapi.com/Client/LoginWithXbox?sdk=XPlatCppSdk-3.6.190304", requestOptions)).json();

            const Entity = {};
            Entity.PlayFabId = BaseEntity.data.PlayFabId;
            Entity.EntityToken = BaseEntity.data.EntityToken.EntityToken;

            const BaseToken = await (await fetch("https://20ca2.playfabapi.com/Authentication/GetEntityToken?sdk=XPlatCppSdk-3.6.190304", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-entitytoken": Entity.EntityToken,
                    "Accept-Language": "en-CA,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate, br",
                    Host: "20ca2.playfabapi.com",
                    Connection: "Keep-Alive",
                    "Cache-Control": "no-cache",
                },
                body: JSON.stringify({
                    Entity: JSON.stringify({
                        Id: Entity.PlayFabId,
                        Type: "master_player_account",
                    }),
                }),
            })).json();

            Entity.XEntityToken = BaseToken.data.EntityToken;

            const info = { XEntityToken: Entity.XEntityToken, PlayFabId: Entity.PlayFabId };
            resolve(info);
        } catch (error) {
            console.error("An error occurred while verifying the account:", error);
            reject(new Error("This is a silly Xbox API Error, if this steal appear after 3 Times try to use an other Acc or Contact Support" + "\nError we got:",error));
        }
    });