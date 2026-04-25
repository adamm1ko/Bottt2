const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'قياس سرعة البوت',
  async execute(message, args, client) {
    const sent = await message.reply('⏱️ جاري القياس...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    await sent.edit({
      content: null,
      embeds: [
        new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🏓 Pong!')
          .addFields(
            { name: '📡 Latency', value: `\`${latency}ms\``, inline: true },
            { name: '💓 API', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
          )
          .setTimestamp()
      ]
    });
  },

  data: new SlashCommandBuilder().setName('ping').setDescription('قياس سرعة البوت'),
  async execute(interaction, client) {
    const sent = await interaction.reply({ content: '⏱️ جاري القياس...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply({
      content: null,
      embeds: [
        new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🏓 Pong!')
          .addFields(
            { name: '📡 Latency', value: `\`${latency}ms\``, inline: true },
            { name: '💓 API', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
          )
          .setTimestamp()
      ]
    });
  },
};
