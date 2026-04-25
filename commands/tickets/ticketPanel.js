const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendTicketPanel } = require('../../systems/ticketSystem');

module.exports = {
  name: 'ticket-panel',
  aliases: ['ticketpanel', 'tp'],
  permissions: [PermissionFlagsBits.ManageGuild],
  description: 'إرسال لوحة التذاكر',
  async execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.channel;
    await sendTicketPanel(channel, message.guild);
    await message.reply(`✅ تم إرسال لوحة التذاكر في ${channel}`);
  },

  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('إرسال لوحة التذاكر')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('القناة (اختياري)').setRequired(false)
    ),
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    await sendTicketPanel(channel, interaction.guild);
    await interaction.reply({ content: `✅ تم إرسال لوحة التذاكر في ${channel}`, ephemeral: true });
  },
};
