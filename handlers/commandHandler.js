const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');
  const commandFolders = fs.readdirSync(commandsPath);
  const slashCommandsData = [];

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const exported = require(path.join(folderPath, file));

      // Support both single export and named exports (like _all.js)
      const commands = exported.name || exported.data
        ? [exported]
        : Object.values(exported);

      for (const command of commands) {
        // Prefix commands (!command)
        if (command.name) {
          client.commands.set(command.name, command);
          if (command.aliases) {
            command.aliases.forEach(alias => client.commands.set(alias, command));
          }
        }

        // Slash commands (/command)
        if (command.data) {
          client.slashCommands.set(command.data.name, command);
          slashCommandsData.push(command.data.toJSON());
        }
      }
    }
  }

  // Register slash commands
  if (slashCommandsData.length > 0) {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: slashCommandsData }
      );
      console.log('✅ Slash commands registered successfully!');
    } catch (err) {
      console.error('❌ Failed to register slash commands:', err);
    }
  }

  console.log(`✅ Loaded ${client.commands.size} prefix commands`);
  console.log(`✅ Loaded ${client.slashCommands.size} slash commands`);
}

module.exports = { loadCommands };
