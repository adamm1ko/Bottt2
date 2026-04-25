const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function buildUserEmbed(member, user) {
  return new EmbedBuilder()
    .setColor(member.displayHexColor || '#5865F2')
    .setTitle(`👤 معلومات العضو`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
    .addFields(
      { name: '🏷️ الاسم', value: user.tag, inline: true },
      { name: '🆔 الآيدي', value: `\`${user.id}\``, inline: true },
      { name: '🤖 بوت؟', value: user.bot ? 'نعم' : 'لا', inline: true },
      { name: '📅 تاريخ إنشاء الحساب', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: '📥 تاريخ الانضمام', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
      { name: '🎭 الرتبة الأعلى', value: `${member.roles.highest}`, inline: true },
      { name: `📋 الرتب (${member.roles.cache.size - 1})`, value: member.roles.cache.filter(r => r.id !== member.guild.id).map(r => `${r}`).slice(0, 10).join(', ') || 'لا يوجد' },
    )
    .setTimestamp();
}

module.exports = {
  name: 'userinfo',
  aliases: ['ui', 'whois'],
  description: 'عرض معلومات عضو',
  async execute(message, args, client) {
    const member = message.mentions.members.first() || message.member;
    const user = member.user;
    await message.reply({ embeds: [buildUserEmbed(member, user)] });
  },

  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('عرض معلومات عضو')
    .addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(false)),
  async execute(interaction) {
    const member = interaction.options.getMember('user') || interaction.member;
    const user = member.user;
    await interaction.reply({ embeds: [buildUserEmbed(member, user)] });
  },
};
