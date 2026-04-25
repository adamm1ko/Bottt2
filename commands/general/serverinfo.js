const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function buildServerEmbed(guild) {
  const channels = guild.channels.cache;
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`🏠 معلومات السيرفر`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
    .addFields(
      { name: '📛 اسم السيرفر', value: guild.name, inline: true },
      { name: '🆔 الآيدي', value: `\`${guild.id}\``, inline: true },
      { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
      { name: '👥 الأعضاء', value: `${guild.memberCount}`, inline: true },
      { name: '📢 القنوات', value: `${channels.filter(c => c.type === 0).size} نص | ${channels.filter(c => c.type === 2).size} صوت`, inline: true },
      { name: '🎭 الرتب', value: `${guild.roles.cache.size}`, inline: true },
      { name: '😀 الإيموجي', value: `${guild.emojis.cache.size}`, inline: true },
      { name: '🔒 التحقق', value: guild.verificationLevel.toString(), inline: true },
      { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
    )
    .setTimestamp();
}

module.exports = {
  name: 'serverinfo',
  aliases: ['si', 'server'],
  description: 'عرض معلومات السيرفر',
  async execute(message) {
    await message.reply({ embeds: [buildServerEmbed(message.guild)] });
  },
  data: new SlashCommandBuilder().setName('serverinfo').setDescription('عرض معلومات السيرفر'),
  async execute(interaction) {
    await interaction.reply({ embeds: [buildServerEmbed(interaction.guild)] });
  },
};
