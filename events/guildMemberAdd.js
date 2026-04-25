const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎉 أهلاً وسهلاً!')
      .setDescription(`مرحباً ${member} في **${member.guild.name}**!\n\nنحن سعداء بانضمامك إلينا 🎊`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 العضو', value: member.user.tag, inline: true },
        { name: '📊 العضو رقم', value: `#${member.guild.memberCount}`, inline: true },
        { name: '📅 تاريخ الانضمام', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() })
      .setTimestamp();

    await channel.send({ content: `${member}`, embeds: [embed] });
  },
};
