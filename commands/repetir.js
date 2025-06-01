const { SlashCommandBuilder } = require('discord.js');
const checkRole = require('../middleware/checkRole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repetir')
        .setDescription('Repite un mensaje específico')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('El ID del mensaje a repetir')
                .setRequired(true)),

    async execute(interaction) {
        const hasPermission = await checkRole()(interaction);
        if (!hasPermission) return;

        const messageId = interaction.options.getString('id');

        try {
            const message = await interaction.channel.messages.fetch(messageId);
            
            if (!message) {
                return interaction.reply({
                    content: 'No se encontró el mensaje especificado.',
                    ephemeral: true
                });
            }

            await interaction.reply({
                content: `**Roster!:**\n${message.content}`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Hubo un error al buscar el mensaje. Asegúrate de que el ID sea correcto y que el mensaje esté en este canal.',
                ephemeral: true
            });
        }
    },
}; 