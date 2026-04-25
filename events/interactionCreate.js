const { EmbedBuilder } = require('discord.js');
const { handleTicketButton } = require('../systems/ticketSystem');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      // Permission check
      if (command.permissions) {
        if (!interaction.member.permissions.has(command.permissions)) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('#FF4444')
                .setDescription('❌ ليس لديك صلاحية لاستخدام هذا الأمر!')
            ],
            ephemeral: true
          });
        }
      }

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(`Error in slash command ${interaction.commandName}:`, err);
        const reply = { content: '❌ حدث خطأ أثناء تنفيذ الأمر!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    }

    // Button interactions
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('ticket_')) {
        await handleTicketButton(interaction, client);
      }
    }

    // String Select Menu
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket_category') {
        const { handleTicketCategory } = require('../systems/ticketSystem');
        await handleTicketCategory(interaction, client);
      }
    }
  },
};
