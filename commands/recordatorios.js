const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Reminder = require('../models/Reminder');
const checkRole = require('../middleware/checkRole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recordatorios')
        .setDescription('Muestra los recordatorios activos'),

    async execute(interaction) {
        // Check for role permission
        const hasPermission = await checkRole()(interaction);
        if (!hasPermission) return;

        try {
            const query = {
                timestamp: { $gt: new Date() },
                guildId: interaction.guildId || null
            };

            const reminders = await Reminder.find(query).sort({ timestamp: 1 });

            if (reminders.length === 0) {
                return interaction.reply({
                    content: 'No hay recordatorios activos en este servidor.',
                    ephemeral: true
                });
            }

            const itemsPerPage = 5;
            let currentPage = 0;
            const maxPage = Math.ceil(reminders.length / itemsPerPage) - 1;

            const generateEmbedText = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const slice = reminders.slice(start, end);

                const reminderList = slice.map(reminder => {
                    const timestamp = Math.floor(reminder.timestamp.getTime() / 1000);
                    const displayId = reminder.shortId ? `\`${reminder.shortId}\`` : `\`${reminder._id}\` (Antiguo)`;
                    const rec = (reminder.recurrence && reminder.recurrence !== 'none') ? `\n**🔁 Frecuencia:** ${reminder.recurrence}` : '';
                    return `**ID:** ${displayId}\n**Canal:** ${reminder.channelName || '<Desconocido>'}\n**Siguiente Fecha:** <t:${timestamp}:F> (<t:${timestamp}:R>)${rec}`;
                }).join('\n\n--- \n\n');

                return `**Recordatorios activos en este servidor (Página ${page + 1}/${maxPage + 1}):**\n\n${reminderList}`;
            };

            const generateButtons = (page) => {
                const row = new ActionRowBuilder();
                
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_page')
                        .setLabel('◀️ Anterior')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('Siguiente ▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === maxPage)
                );
                return row;
            };

            const initialText = generateEmbedText(currentPage);
            const initialComponents = maxPage > 0 ? [generateButtons(currentPage)] : [];

            const response = await interaction.reply({
                content: initialText,
                components: initialComponents,
                ephemeral: true,
                fetchReply: true
            });

            if (maxPage > 0) {
                const collector = response.createMessageComponentCollector({ time: 120000 });

                collector.on('collect', async i => {
                    if (i.customId === 'prev_page' && currentPage > 0) {
                        currentPage--;
                    } else if (i.customId === 'next_page' && currentPage < maxPage) {
                        currentPage++;
                    }

                    await i.update({
                        content: generateEmbedText(currentPage),
                        components: [generateButtons(currentPage)]
                    });
                });

                collector.on('end', () => {
                    const disabledRow = generateButtons(currentPage);
                    disabledRow.components.forEach(c => c.setDisabled(true));
                    interaction.editReply({ components: [disabledRow] }).catch(() => {});
                });
            }

        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: 'Hubo un error al obtener los recordatorios.',
                    ephemeral: true
                });
            }
        }
    },
};