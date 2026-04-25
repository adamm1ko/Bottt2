const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const helpEmbed = (guild) => new EmbedBuilder()
  .setColor('#5865F2')
  .setTitle('📖 قائمة الأوامر')
  .setDescription('جميع الأوامر تعمل بـ `!` و `/`')
  .addFields(
    {
      name: '🎫 نظام التذاكر',
      value: [
        '`ticket-panel` - إرسال لوحة التذاكر',
        '`tickets` - عرض التذاكر المفتوحة',
      ].join('\n'),
      inline: false,
    },
    {
      name: '🛡️ أوامر الإدارة',
      value: [
        '`kick @عضو [سبب]` - طرد عضو',
        '`ban @عضو [سبب]` - حظر عضو',
        '`mute @عضو [مدة]` - كتم عضو',
        '`clear [عدد]` - حذف رسائل',
      ].join('\n'),
      inline: true,
    },
    {
      name: '📊 أوامر عامة',
      value: [
        '`userinfo [@عضو]` - معلومات عضو',
        '`serverinfo` - معلومات السيرفر',
        '`avatar [@عضو]` - صورة عضو',
        '`ping` - سرعة البوت',
      ].join('\n'),
      inline: true,
    },
  )
  .setFooter({ text: guild?.name || 'Discord Bot', iconURL: guild?.iconURL() })
  .setTimestamp();

module.exports = {
  // Prefix command
  name: 'help',
  aliases: ['h', 'commands'],
  description: 'عرض قائمة الأوامر',
  async execute(message, args, client) {
    await message.reply({ embeds: [helpEmbed(message.guild)] });
  },

  // Slash command
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('عرض قائمة الأوامر'),
  async execute(interaction, client) {
    await interaction.reply({ embeds: [helpEmbed(interaction.guild)], ephemeral: true });
  },
};
