const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const checkRole = require('../middleware/checkRole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reprogramar')
        .setDescription('Reprograma un recordatorio existente')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('El ID del recordatorio')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('timestamp')
                .setDescription('El nuevo timestamp (formato: <t:timestamp:f>)')
                .setRequired(true)),

    async execute(interaction) {
        // Check for role permission
        const hasPermission = await checkRole()(interaction);
        if (!hasPermission) return;

        const reminderId = interaction.options.getString('id');
        const timestampStr = interaction.options.getString('timestamp');

        // Extract timestamp from Discord timestamp format
        const timestampMatch = timestampStr.match(/<t:(\d+):f>/);
        if (!timestampMatch) {
            return interaction.reply({
                content: 'Formato de timestamp inválido. Usa el formato <t:timestamp:f>',
                ephemeral: true
            });
        }

        const newTimestamp = new Date(parseInt(timestampMatch[1]) * 1000);

        // Check if timestamp is in the future
        if (newTimestamp <= new Date()) {
            return interaction.reply({
                content: 'El timestamp debe ser en el futuro.',
                ephemeral: true
            });
        }

        try {
            const reminder = await Reminder.findById(reminderId);
            
            if (!reminder) {
                return interaction.reply({
                    content: 'No se encontró el recordatorio especificado.',
                    ephemeral: true
                });
            }

            reminder.timestamp = newTimestamp;
            await reminder.save();

            await interaction.reply({
                content: `✅ Recordatorio reprogramado para <t:${Math.floor(newTimestamp.getTime() / 1000)}:f>`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Hubo un error al reprogramar el recordatorio.',
                ephemeral: true
            });
        }
    },
}; 