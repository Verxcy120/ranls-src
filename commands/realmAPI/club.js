const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dumprealm,getClubData } = require('../../men/realms');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const config = require('../../data/discord/config.json');
const fs = require('node:fs');
const colors = require('../../data/handles/colors.js');
const path = require('path');
const { reply1, reply2}=require('../../data/discord/emojies.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clubdata')
        .setDescription('get the club data of a realm')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addStringOption(option => 
            option.setName('invite')
                .setDescription('Realm invite code')
                .setRequired(true)
                .setMinLength(11)
                .setMaxLength(15)),
    async execute(interaction) {
        const inviteCode = interaction.options.getString('invite');

        try{

        const embed = new EmbedBuilder()
            .setTitle('Getting Realm')
            .setDescription(`Getting Realm Data , this may take a few Seconds`)
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
            const realmInfo = await getClubData(inviteCode);

            if (!realmInfo) {
                try{

                const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`Invalid code given, please check if that is a valid code `)
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
                .setTitle('Club Dump')
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