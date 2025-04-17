const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dumprealm, checkaccount, getrealminfo,gethostandport,onlineusers } = require('../../men/realms');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const config = require('../../data/discord/config.json');
const fs = require('node:fs');
const colors = require('../../data/handles/colors.js');
const path = require('path');
const { reply1, reply2}=require('../../data/discord/emojies.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerlist')
        .setDescription('Gets the Playerlist .')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addStringOption(option => 
            option.setName('code')
                .setDescription('Realm Code')
                .setRequired(true)
                .setMinLength(8)
                .setMaxLength(15)),
    async execute(interaction) {
        const code = interaction.options.getString('code');
        
        try{
        const embed = new EmbedBuilder()
            .setTitle('Playerlist')
            .setDescription(`Getting Realm Data`)
            .setColor(config.embeds.color)
            await interaction.reply({ embeds: [embed] })
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
        try {
            const club = await getrealminfo(code);
            const realmInfo = await onlineusers(club.clubId, interaction);

            if (!realmInfo) {
                try{

                const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`Resived invaild ID given.`)
                .setColor(config.embeds.color)

                return  interaction.editReply({ embeds: [embed] })
            } catch(error){
                if (error.code === 10008 || error.message.includes('Unknown Message')) {
                    return; 
                } else {
                    console.log(error.message);
                }
            }
            }

            try{

            const embed = new EmbedBuilder()
                .setTitle('Playerlist')
                .setDescription(`\`\`\`json\n${JSON.stringify(realmInfo, null, 2)}\n\`\`\``)
                .setColor(config.embeds.color)
            await interaction.editReply({ embeds: [embed] });
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
        } catch (error) {
            try{

            const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`\`\`\`json\n${JSON.stringify(error.message, null, 2)}\`\`\``)
                .setColor(config.embeds.color)
            return interaction.editReply({ embeds: [embed] })
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
        }
    },
};