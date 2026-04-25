const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function buildAvatarEmbed(user) {
  const avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`🖼️ صورة ${user.username}`)
    .setImage(avatar)
    .addFields(
      { name: '🔗 روابط', value: `[PNG](${user.displayAvatarURL({ format: 'png', size: 1024 })}) | [JPG](${user.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [WEBP](${user.displayAvatarURL({ format: 'webp', size: 1024 })})` }
    )
    .setTimestamp();
}

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: 'عرض صورة عضو',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    await message.reply({ embeds: [buildAvatarEmbed(user)] });
  },
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('عرض صورة عضو')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    await interaction.reply({ embeds: [buildAvatarEmbed(user)] });
  },
};
