const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
require('dotenv').config();

// In-memory ticket store (use a database for production)
const tickets = new Map();

const TICKET_CATEGORIES = [
  { label: '🛠️ دعم تقني', value: 'technical', description: 'مشاكل تقنية أو أخطاء' },
  { label: '💰 دعم مالي', value: 'billing', description: 'استفسارات الدفع والاشتراكات' },
  { label: '🚨 بلاغ عن مشكلة', value: 'report', description: 'بلاغ عن عضو أو محتوى' },
  { label: '❓ استفسار عام', value: 'general', description: 'أي استفسار آخر' },
];

const categoryEmojis = {
  technical: '🛠️',
  billing: '💰',
  report: '🚨',
  general: '❓',
};

// Send ticket panel to a channel
async function sendTicketPanel(channel, guild) {
  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🎫 نظام التذاكر')
    .setDescription(
      '**أهلاً بك في نظام الدعم!**\n\n' +
      'اضغط على الزر أدناه لفتح تذكرة دعم جديدة.\n' +
      'سيقوم فريق الدعم بالرد عليك في أقرب وقت ممكن.\n\n' +
      '📋 **فئات الدعم المتاحة:**\n' +
      TICKET_CATEGORIES.map(c => `${c.label} - ${c.description}`).join('\n')
    )
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setFooter({ text: `${guild.name} • نظام الدعم`, iconURL: guild.iconURL() })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_open')
      .setLabel('📩 فتح تذكرة')
      .setStyle(ButtonStyle.Primary)
  );

  await channel.send({ embeds: [embed], components: [row] });
}

// Handle button interactions
async function handleTicketButton(interaction, client) {
  const { customId, guild, member } = interaction;

  if (customId === 'ticket_open') {
    // Check if user already has open ticket
    const existingTicket = [...tickets.values()].find(
      t => t.userId === member.id && t.guildId === guild.id && t.status === 'open'
    );

    if (existingTicket) {
      const channel = guild.channels.cache.get(existingTicket.channelId);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF4444')
            .setDescription(`❌ لديك تذكرة مفتوحة بالفعل! ${channel ? channel : 'التذكرة: #' + existingTicket.id}`)
        ],
        ephemeral: true
      });
    }

    // Show category selection
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_category')
      .setPlaceholder('اختر فئة الدعم...')
      .addOptions(TICKET_CATEGORIES);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('📋 اختر فئة الدعم')
          .setDescription('الرجاء اختيار الفئة المناسبة لمشكلتك:')
      ],
      components: [row],
      ephemeral: true
    });
  }

  if (customId === 'ticket_close') {
    const ticket = [...tickets.values()].find(t => t.channelId === interaction.channel.id);
    if (!ticket) return interaction.reply({ content: '❌ لم يتم العثور على هذه التذكرة.', ephemeral: true });

    const isSupport = interaction.member.roles.cache.has(process.env.SUPPORT_ROLE_ID);
    const isOwner = ticket.userId === interaction.user.id;

    if (!isSupport && !isOwner && !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ ليس لديك صلاحية لإغلاق هذه التذكرة.', ephemeral: true });
    }

    ticket.status = 'closing';
    tickets.set(ticket.id, ticket);

    const embed = new EmbedBuilder()
      .setColor('#FF4444')
      .setTitle('🔒 إغلاق التذكرة')
      .setDescription(`سيتم إغلاق التذكرة بواسطة ${interaction.user}\n\nاضغط **تأكيد** للإغلاق أو **إلغاء** للتراجع.`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_confirm_close').setLabel('✅ تأكيد').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ticket_cancel_close').setLabel('❌ إلغاء').setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }

  if (customId === 'ticket_confirm_close') {
    const ticket = [...tickets.values()].find(t => t.channelId === interaction.channel.id);
    if (!ticket) return;

    await interaction.update({ content: '🔒 جاري إغلاق التذكرة...', embeds: [], components: [] });

    // Log the closure
    const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor('#FF4444')
        .setTitle('🔒 تذكرة مغلقة')
        .addFields(
          { name: 'رقم التذكرة', value: `#${ticket.id}`, inline: true },
          { name: 'صاحب التذكرة', value: `<@${ticket.userId}>`, inline: true },
          { name: 'أُغلقت بواسطة', value: `${interaction.user}`, inline: true },
          { name: 'الفئة', value: ticket.category, inline: true },
          { name: 'وقت الإنشاء', value: `<t:${Math.floor(ticket.createdAt / 1000)}:R>`, inline: true },
        )
        .setTimestamp();
      await logChannel.send({ embeds: [logEmbed] });
    }

    tickets.delete(ticket.id);
    setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
  }

  if (customId === 'ticket_cancel_close') {
    const ticket = [...tickets.values()].find(t => t.channelId === interaction.channel.id);
    if (ticket) { ticket.status = 'open'; tickets.set(ticket.id, ticket); }
    await interaction.update({ content: '✅ تم إلغاء الإغلاق.', embeds: [], components: [] });
  }

  if (customId === 'ticket_claim') {
    const ticket = [...tickets.values()].find(t => t.channelId === interaction.channel.id);
    if (!ticket) return;

    const isSupport = interaction.member.roles.cache.has(process.env.SUPPORT_ROLE_ID);
    if (!isSupport && !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ فقط موظفو الدعم يمكنهم استلام التذاكر.', ephemeral: true });
    }

    ticket.claimedBy = interaction.user.id;
    tickets.set(ticket.id, ticket);

    const embed = new EmbedBuilder()
      .setColor('#00FF88')
      .setDescription(`✅ تم استلام التذكرة بواسطة ${interaction.user}`);

    await interaction.reply({ embeds: [embed] });
    await interaction.channel.setName(`claimed-${interaction.channel.name.replace('ticket-', '')}`);
  }
}

// Handle category selection
async function handleTicketCategory(interaction, client) {
  const { guild, member, values } = interaction;
  const category = values[0];
  const categoryLabel = TICKET_CATEGORIES.find(c => c.value === category)?.label || category;
  const emoji = categoryEmojis[category] || '🎫';

  await interaction.deferReply({ ephemeral: true });

  // Create ticket channel
  const ticketId = Date.now().toString().slice(-6);
  const categoryChannel = guild.channels.cache.get(process.env.TICKET_CATEGORY_ID);
  const supportRole = process.env.SUPPORT_ROLE_ID;

  const permissionOverwrites = [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
  ];

  if (supportRole) {
    permissionOverwrites.push({
      id: supportRole,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages],
    });
  }

  const ticketChannel = await guild.channels.create({
    name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${ticketId}`,
    type: ChannelType.GuildText,
    parent: categoryChannel?.id,
    permissionOverwrites,
    topic: `تذكرة ${categoryLabel} | بواسطة ${member.user.tag} | ID: ${ticketId}`,
  });

  // Store ticket
  tickets.set(ticketId, {
    id: ticketId,
    userId: member.id,
    guildId: guild.id,
    channelId: ticketChannel.id,
    category: categoryLabel,
    status: 'open',
    createdAt: Date.now(),
    claimedBy: null,
  });

  // Send ticket embed
  const ticketEmbed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`${emoji} تذكرة ${categoryLabel}`)
    .setDescription(
      `مرحباً ${member}!\n\n` +
      `شكراً لتواصلك معنا. سيقوم فريق الدعم بالرد عليك قريباً.\n\n` +
      `**📋 معلومات التذكرة:**\n` +
      `• رقم التذكرة: \`#${ticketId}\`\n` +
      `• الفئة: ${categoryLabel}\n` +
      `• الوقت: <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
      `**من فضلك اشرح مشكلتك بالتفصيل.**`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `${guild.name} • Support System` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel('🔒 إغلاق التذكرة').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket_claim').setLabel('✋ استلام التذكرة').setStyle(ButtonStyle.Success)
  );

  const mention = supportRole ? `<@&${supportRole}>` : '';
  await ticketChannel.send({ content: `${member} ${mention}`, embeds: [ticketEmbed], components: [row] });

  // Log ticket creation
  const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);
  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setColor('#00FF88')
      .setTitle('🎫 تذكرة جديدة')
      .addFields(
        { name: 'رقم التذكرة', value: `#${ticketId}`, inline: true },
        { name: 'صاحب التذكرة', value: `${member}`, inline: true },
        { name: 'الفئة', value: categoryLabel, inline: true },
        { name: 'القناة', value: `${ticketChannel}`, inline: true },
      )
      .setTimestamp();
    await logChannel.send({ embeds: [logEmbed] });
  }

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor('#00FF88')
        .setDescription(`✅ تم فتح تذكرتك! ${ticketChannel}`)
    ]
  });
}

module.exports = { sendTicketPanel, handleTicketButton, handleTicketCategory };
