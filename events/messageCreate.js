const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    // Permission check
    if (command.permissions) {
      if (!message.member.permissions.has(command.permissions)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF4444')
              .setDescription('❌ ليس لديك صلاحية لاستخدام هذا الأمر!')
          ]
        });
      }
    }

    // Guild only check
    if (command.guildOnly && !message.guild) {
      return message.reply('❌ هذا الأمر يعمل فقط في السيرفر!');
    }

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`Error in prefix command ${commandName}:`, err);
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF4444')
            .setDescription('❌ حدث خطأ أثناء تنفيذ الأمر!')
        ]
      });
    }
  },
};
