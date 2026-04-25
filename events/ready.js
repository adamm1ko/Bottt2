const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`\n🤖 Bot is online as: ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);

    const activities = [
      { name: '!help | /help', type: ActivityType.Watching },
      { name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} members`, type: ActivityType.Watching },
      { name: 'Ticket System 🎫', type: ActivityType.Playing },
    ];

    let i = 0;
    client.user.setActivity(activities[0].name, { type: activities[0].type });

    setInterval(() => {
      i = (i + 1) % activities.length;
      client.user.setActivity(activities[i].name, { type: activities[i].type });
    }, 15000);
  },
};
