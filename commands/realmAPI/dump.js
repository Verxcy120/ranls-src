const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dumprealm, checkaccount, getrealminfo,gethostandport } = require('../../men/realms');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const config = require('../../data/discord/config.json');
const fs = require('node:fs');
const colors = require('../../data/handles/colors.js');
const path = require('path');
const { reply1, reply2}=require('../../data/discord/emojies.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('realmdump')
        .setDescription('Get not much info on a realm.')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addStringOption(option => 
            option.setName('invite')
                .setDescription('Realm invite code')
                .setRequired(true)
                .setMinLength(11)
                .setMaxLength(15)),
    async execute(interaction) {
        interaction.client.on('error', console.error);
        const invite = interaction.options.getString('invite');

        await interaction.reply({ embeds: [
            new EmbedBuilder()
                .setTitle('Loading')
                .setDescription(`Getting Realm ,this may take a few Seconds`)
                .setColor(config.embeds.color)
            ] 
        })                                                
        const whitelist = JSON.parse(fs.readFileSync('./data/discord/whitelist.json', 'utf8'));
        if(whitelist.includes(invite)) {
            return interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setTitle('Bot Error')
                    .setDescription(`The invite code is in the whitelist.`)
                    .setColor(config.embeds.color)
            ]})
        }
        try {
            const realmInfo = await getrealminfo(invite);

            if (!realmInfo) {
                return interaction.editReply({ embeds: [
                    new EmbedBuilder()
                        .setTitle('Bot  Error')
                        .setDescription(`The results back are empty, this may be due to the code been wrong or the account used is banned.`)
                        .setColor(config.embeds.color)
                    ] 
                })
            }


        await interaction.editReply({ embeds: [
            new EmbedBuilder()
                .setTitle('Realm Dump')
                .setDescription(`\`\`\`json\n${JSON.stringify(realmInfo, null, 2)}\n\`\`\``)
                .setColor(config.embeds.color)
            ] 
        })

        } catch (error) {
            console.log(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.cyan}error ${colors.brightCyan}>> error on dump command ${error.message ?? error} ${colors.blue}(dump)${colors.reset}`)
            return interaction.editReply({ embeds: [
            new EmbedBuilder()
                .setTitle('Bot Error')
                .setDescription(`There was an Error while Processing your Request `)
                .setColor(config.embeds.color)
            ] 
        })
        }
    },
};
