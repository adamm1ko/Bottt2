const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// ─── KICK ───────────────────────────────────────────────────────────────────
const kickCmd = {
  name: 'kick',
  permissions: [PermissionFlagsBits.KickMembers],
  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ حدد العضو! مثال: `!kick @عضو سبب`');
    const reason = args.slice(1).join(' ') || 'لم يذكر سبب';
    if (!member.kickable) return message.reply('❌ لا يمكنني طرد هذا العضو!');
    await member.kick(reason);
    await message.reply({ embeds: [modEmbed('👢 طرد عضو', member.user, message.author, reason, '#FF6B35')] });
  },
  data: new SlashCommandBuilder()
    .setName('kick').setDescription('طرد عضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(false)),
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'لم يذكر سبب';
    if (!member.kickable) return interaction.reply({ content: '❌ لا يمكنني طرد هذا العضو!', ephemeral: true });
    await member.kick(reason);
    await interaction.reply({ embeds: [modEmbed('👢 طرد عضو', member.user, interaction.user, reason, '#FF6B35')] });
  },
};

// ─── BAN ────────────────────────────────────────────────────────────────────
const banCmd = {
  name: 'ban',
  permissions: [PermissionFlagsBits.BanMembers],
  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ حدد العضو! مثال: `!ban @عضو سبب`');
    const reason = args.slice(1).join(' ') || 'لم يذكر سبب';
    if (!member.bannable) return message.reply('❌ لا يمكنني حظر هذا العضو!');
    await member.ban({ reason, deleteMessageSeconds: 86400 });
    await message.reply({ embeds: [modEmbed('🔨 حظر عضو', member.user, message.author, reason, '#FF0000')] });
  },
  data: new SlashCommandBuilder()
    .setName('ban').setDescription('حظر عضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(false)),
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'لم يذكر سبب';
    if (!member.bannable) return interaction.reply({ content: '❌ لا يمكنني حظر هذا العضو!', ephemeral: true });
    await member.ban({ reason, deleteMessageSeconds: 86400 });
    await interaction.reply({ embeds: [modEmbed('🔨 حظر عضو', member.user, interaction.user, reason, '#FF0000')] });
  },
};

// ─── MUTE (Timeout) ──────────────────────────────────────────────────────────
const muteCmd = {
  name: 'mute',
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ حدد العضو! مثال: `!mute @عضو 10 سبب`');
    const minutes = parseInt(args[1]) || 10;
    const reason = args.slice(2).join(' ') || 'لم يذكر سبب';
    await member.timeout(minutes * 60 * 1000, reason);
    await message.reply({ embeds: [modEmbed(`🔇 كتم عضو (${minutes} دقيقة)`, member.user, message.author, reason, '#FFA500')] });
  },
  data: new SlashCommandBuilder()
    .setName('mute').setDescription('كتم عضو مؤقتاً')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addIntegerOption(o => o.setName('minutes').setDescription('المدة بالدقائق').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(false)),
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'لم يذكر سبب';
    await member.timeout(minutes * 60 * 1000, reason);
    await interaction.reply({ embeds: [modEmbed(`🔇 كتم عضو (${minutes} دقيقة)`, member.user, interaction.user, reason, '#FFA500')] });
  },
};

// ─── CLEAR ───────────────────────────────────────────────────────────────────
const clearCmd = {
  name: 'clear',
  aliases: ['purge', 'delete'],
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args) {
    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) return message.reply('❌ حدد عدد من 1 إلى 100');
    const deleted = await message.channel.bulkDelete(amount + 1, true);
    const reply = await message.channel.send({
      embeds: [new EmbedBuilder().setColor('#00FF88').setDescription(`✅ تم حذف **${deleted.size - 1}** رسالة بواسطة ${message.author}`)]
    });
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  },
  data: new SlashCommandBuilder()
    .setName('clear').setDescription('حذف رسائل')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName('amount').setDescription('عدد الرسائل (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.editReply({ content: `✅ تم حذف **${deleted.size}** رسالة` });
  },
};

// ─── Helper ──────────────────────────────────────────────────────────────────
function modEmbed(title, target, mod, reason, color) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .addFields(
      { name: '👤 العضو', value: `${target.tag} (${target.id})`, inline: true },
      { name: '🛡️ المشرف', value: `${mod.tag}`, inline: true },
      { name: '📋 السبب', value: reason },
    )
    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
    .setTimestamp();
}

module.exports = { kick: kickCmd, ban: banCmd, mute: muteCmd, clear: clearCmd };
