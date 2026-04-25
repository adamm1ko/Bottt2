const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { startKeepAlive } = require('./utils/keepAlive');
require('dotenv').config();
require('./utils/errorHandler');

// Start keep-alive HTTP server (required for Railway)
startKeepAlive();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.prefix = '!';

loadCommands(client);
loadEvents(client);

client.login(process.env.TOKEN);
