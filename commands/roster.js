const { SlashCommandBuilder } = require('discord.js');
const checkRole = require('../middleware/checkRole');
const { getRandomGif } = require('../data/gifs');
const Reminder = require('../models/Reminder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roster')
        .setDescription('Crea un anuncio de roster con timestamp')
        .addStringOption(option =>
            option.setName('fecharoster')
                .setDescription('La fecha del roster (formato: <t:timestamp:f>)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('fechalanzar')
                .setDescription('La fecha en que se lanzará el mensaje (formato: <t:timestamp:f>)')
                .setRequired(true)),

    async execute(interaction) {
        const hasPermission = await checkRole()(interaction);
        if (!hasPermission) return;

        const rosterTimestampStr = interaction.options.getString('fecharoster');
        const launchTimestampStr = interaction.options.getString('fechalanzar');

        const rosterTimestampMatch = rosterTimestampStr.match(/<t:(\d+):f>/);
        const launchTimestampMatch = launchTimestampStr.match(/<t:(\d+):f>/);

        if (!rosterTimestampMatch || !launchTimestampMatch) {
            return interaction.reply({
                content: 'Formato de timestamp inválido. Usa el formato <t:timestamp:f>',
                ephemeral: true
            });
        }

        const rosterTimestamp = new Date(parseInt(rosterTimestampMatch[1]) * 1000);
        const launchTimestamp = new Date(parseInt(launchTimestampMatch[1]) * 1000);

        if (launchTimestamp <= new Date()) {
            return interaction.reply({
                content: 'La fecha de lanzamiento debe ser en el futuro.',
                ephemeral: true
            });
        }

        // Ajuste manual para UTC-5 (Colombia)
        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        // Restar 5 horas al timestamp para Colombia
        const colombiaTimestamp = new Date(rosterTimestamp.getTime() - (5 * 60 * 60 * 1000));
        const diaSemana = diasSemana[colombiaTimestamp.getUTCDay()];
        const dia = colombiaTimestamp.getUTCDate();
        const mes = meses[colombiaTimestamp.getUTCMonth()];
        const dateStr = `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dia} de ${mes}`;

        const timeTimestamp = rosterTimestampStr.replace(':f>', ':t>');

        const rosterMessage = `@everyone\n\n📅 ~ ${dateStr}\n⏰ 3:00 Hora Server\n📈 ~ [ INFERNO ]\n\nMental: \nPala:\nBoltero:\nBoltero:\nHw:\nSniper:\nHigh Priest:\nHigh Priest:\nLinker:\nLinker:\nClown:\nGypsi:`;

        try {
            const reminder = new Reminder({
                userId: interaction.user.id,
                channelId: interaction.channelId,
                message: rosterMessage,
                timestamp: launchTimestamp,
                messageType: 'roster'
            });

            await reminder.save();

            await interaction.reply({
                content: `✅ Roster programado para lanzarse el <t:${Math.floor(launchTimestamp.getTime() / 1000)}:f>`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Hubo un error al programar el roster.',
                ephemeral: true
            });
        }
    },
}; 