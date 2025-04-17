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
        .setName('realmip')
        .setDescription('Get the Realm IP')
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
        await interaction.deferReply({ ephemeral: true });
        try{

        const embed = new EmbedBuilder()
            .setTitle('Realm IP')
            .setDescription(`Getting Realm Data this may take few Seconds`)
            .setColor(config.embeds.color)
            await interaction.editReply({ embeds: [embed] })
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
        try {
            const realmInfo = await gethostandport(inviteCode);

            if (!realmInfo) {
                try{

                const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`Invalid code given. Please check if that is a valid code .`)
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
                .setTitle('Realm IP')
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