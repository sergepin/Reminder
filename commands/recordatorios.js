const { SlashCommandBuilder } = require('discord.js');
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

            const reminderList = reminders.map(reminder => {
                const timestamp = Math.floor(reminder.timestamp.getTime() / 1000);
                return `**ID:** ${reminder._id}\n**Canal:** ${reminder.channelName || '<Desconocido>'}\n**Fecha:** <t:${timestamp}:F> (<t:${timestamp}:R>)`;
            }).join('\n\n');

            await interaction.reply({
                content: `**Recordatorios activos en este servidor:**\n\n${reminderList}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Hubo un error al obtener los recordatorios.',
                ephemeral: true
            });
        }
    },
}; 