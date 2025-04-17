const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Authflow } = require('prismarine-auth');
const { RealmAPI } = require('prismarine-realms');
const fs = require('node:fs');
const { dumprealm, checkaccount, getrealminfo,gethostandport } = require('../../men/realms');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const config = require('../../data/discord/config.json');
const colors = require('../../data/handles/colors.js');
const path = require('path');
const { reply1, reply2}=require('../../data/discord/emojies.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('pendinginvites')
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2)
    .setDescription('Manage your pending invites'),
  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const profilesFolder = `./data/user/profilefolders/${interaction.user.id}`;
      if (!fs.existsSync(profilesFolder)) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('No Account Linked')
              .setDescription('You require a Linked Account to use this Command.'+ "Link a Account with `/link`")
              .setColor(config.embeds.color),
          ],
        });
        return;
      }

      const authFlow = new Authflow(interaction.user.id, profilesFolder);
      const api = RealmAPI.from(authFlow, 'bedrock');
      const pendingInvites = await api.getPendingInvites();

      if (!pendingInvites.length) {
        await interaction.editReply({
          embeds: [new EmbedBuilder().setDescription('No Pending Invites')],
        });
        return;
      }

      let currentPage = 0;

      const createEmbed = () => {
        return new EmbedBuilder()
          .setColor(config.embeds.color)
          .setTitle('Pending Invites')
          .setDescription(
            `**Realm Name:** ${invite.worldName}\n` +
            `**Realm Owner:** ${invite.worldOwnerName}\n` +
            `**Invitation ID:** ${invite.invitationId}\n`
          )
          .setFooter({ text: `Invite ${currentPage + 1} of ${pendingInvites.length}` });
      };

      const generateActionRow = () => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('Back')
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Accept')
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('deny')
            .setLabel('Deny')
            .setEmoji("❌")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === pendingInvites.length - 1)
        );
      };

      await interaction.editReply({
        embeds: [createEmbed(pendingInvites[currentPage])],
        components: [generateActionRow()],
      });

      const buttonHandler = async (buttonInteraction) => {
        if (!buttonInteraction.isButton() || buttonInteraction.user.id !== interaction.user.id) {
          return await buttonInteraction.reply({ content: 'You cannot use this button.', ephemeral: true });
        }

        const { customId } = buttonInteraction;

        if (customId === 'previous' && currentPage > 0) {
          currentPage--;
        } else if (customId === 'next' && currentPage < pendingInvites.length - 1) {
          currentPage++;
        } else if (customId === 'accept') {
          await api.acceptRealmInvitation(pendingInvites[currentPage].invitationId);
          await buttonInteraction.reply({ content: 'Invite Accsepted', ephemeral: true });
          return;
        } else if (customId === 'deny') {
          await api.rejectRealmInvitation(pendingInvites[currentPage].invitationId);
          await buttonInteraction.reply({ content: 'Invite Rejected!', ephemeral: true });
          return;
        }

        await buttonInteraction.update({
          embeds: [createEmbed(pendingInvites[currentPage])],
          components: [generateActionRow()],
        });
      };

      interaction.client.on('interactionCreate', buttonHandler);

      setTimeout(() => {
        interaction.client.off('interactionCreate', buttonHandler);
        interaction.editReply({ components: [] });
      }, 600 * 1000);
    } catch (error) {
      console.error('Error while making this Request:', error);
      await interaction.editReply({
        embeds: [new EmbedBuilder().setDescription(`There was an Error while this Request ${error.message}`)],
      });
    }
  },
};
