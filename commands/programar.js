const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const checkRole = require('../middleware/checkRole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('programar')
        .setDescription('Programa un recordatorio')
        .addStringOption(option =>
            option.setName('timestamp')
                .setDescription('El timestamp del recordatorio (formato: <t:timestamp:f>)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('ID del mensaje a recordar')
                .setRequired(true)),

    async execute(interaction) {
        // Check for role permission
        const hasPermission = await checkRole()(interaction);
        if (!hasPermission) return;

        const timestampStr = interaction.options.getString('timestamp');
        const messageId = interaction.options.getString('messageid');

        // Extract timestamp from Discord timestamp format
        const timestampMatch = timestampStr.match(/<t:(\d+):f>/);
        if (!timestampMatch) {
            return interaction.reply({
                content: 'Formato de timestamp inválido. Usa el formato <t:timestamp:f>',
                ephemeral: true
            });
        }

        const timestamp = new Date(parseInt(timestampMatch[1]) * 1000);

        // Check if timestamp is in the future
        if (timestamp <= new Date()) {
            return interaction.reply({
                content: 'El timestamp debe ser en el futuro.',
                ephemeral: true
            });
        }

        try {
            // Verificar que el mensaje existe
            const originalMessage = await interaction.channel.messages.fetch(messageId);
            if (!originalMessage) {
                return interaction.reply({
                    content: 'No se encontró el mensaje especificado.',
                    ephemeral: true
                });
            }

            const reminder = new Reminder({
                userId: interaction.user.id,
                channelId: interaction.channelId,
                message: 'Equipense, nos vemos arriba', // Mensaje fijo
                messageId: messageId,
                timestamp: timestamp
            });

            await reminder.save();

            await interaction.reply({
                content: `✅ Recordatorio programado para <t:${Math.floor(timestamp.getTime() / 1000)}:f>`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Hubo un error al programar el recordatorio.',
                ephemeral: true
            });
        }
    },
}; 