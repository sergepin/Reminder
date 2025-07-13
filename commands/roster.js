const { SlashCommandBuilder } = require('discord.js');
const checkRole = require('../middleware/checkRole');
const { getRandomGif } = require('../data/gifs');
const Reminder = require('../models/Reminder');

// Configuración centralizada
const CONFIG = {
    TIMEZONE_OFFSET: -5, // UTC-5 para Colombia
    ROSTER_TIME: '3:00',
    DIAS_SEMANA: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    MESES: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    ROSTER_TEMPLATE: (dateStr, timeTimestamp) => 
        `@everyone\n\n📅 ~ ${dateStr}\n⏰ ${CONFIG.ROSTER_TIME} Hora Server\n📈 ~ [ INFERNO ]\n\nMental: \nPala:\nBoltero:\nBoltero:\nHw:\nSniper:\nHigh Priest:\nHigh Priest:\nLinker:\nLinker:\nClown:\nGypsi:`
};

// Utilidades para manejo de fechas
const DateUtils = {
    /**
     * Extrae timestamp de formato Discord
     * @param {string} timestampStr - String con formato <t:timestamp:f>
     * @returns {number|null} - Timestamp en segundos o null si inválido
     */
    extractTimestamp(timestampStr) {
        const match = timestampStr.match(/<t:(\d+):f>/);
        return match ? parseInt(match[1]) : null;
    },

    /**
     * Convierte timestamp a fecha en zona horaria de Colombia
     * @param {number} timestamp - Timestamp en segundos
     * @returns {Date} - Fecha ajustada a UTC-5
     */
    toColombiaTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return new Date(date.getTime() + (CONFIG.TIMEZONE_OFFSET * 60 * 60 * 1000));
    },

    /**
     * Formatea fecha para mostrar en español
     * @param {Date} date - Fecha a formatear
     * @returns {string} - Fecha formateada
     */
    formatDateSpanish(date) {
        const diaSemana = CONFIG.DIAS_SEMANA[date.getUTCDay()];
        const dia = date.getUTCDate();
        const mes = CONFIG.MESES[date.getUTCMonth()];
        return `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dia} de ${mes}`;
    },

    /**
     * Valida que una fecha sea en el futuro
     * @param {Date} date - Fecha a validar
     * @param {string} fieldName - Nombre del campo para el mensaje de error
     * @returns {boolean} - true si es válida
     */
    validateFutureDate(date, fieldName) {
        const now = new Date();
        const buffer = 5 * 60 * 1000; // 5 minutos de buffer
        return date.getTime() > (now.getTime() + buffer);
    }
};

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
        try {
            // Verificar permisos
            const hasPermission = await checkRole()(interaction);
            if (!hasPermission) return;

            // Extraer y validar timestamps
            const rosterTimestampStr = interaction.options.getString('fecharoster');
            const launchTimestampStr = interaction.options.getString('fechalanzar');

            const rosterTimestamp = DateUtils.extractTimestamp(rosterTimestampStr);
            const launchTimestamp = DateUtils.extractTimestamp(launchTimestampStr);

            if (!rosterTimestamp || !launchTimestamp) {
                return interaction.reply({
                    content: '❌ Formato de timestamp inválido. Usa el formato <t:timestamp:f>',
                    ephemeral: true
                });
            }

            // Convertir a objetos Date
            const rosterDate = new Date(rosterTimestamp * 1000);
            const launchDate = new Date(launchTimestamp * 1000);

            // Validar que la fecha de lanzamiento sea en el futuro
            if (!DateUtils.validateFutureDate(launchDate, 'fecha de lanzamiento')) {
                return interaction.reply({
                    content: '❌ La fecha de lanzamiento debe ser al menos 5 minutos en el futuro.',
                    ephemeral: true
                });
            }

            // Validar que la fecha del roster sea razonable (no más de 1 año en el futuro)
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            
            if (rosterDate > oneYearFromNow) {
                return interaction.reply({
                    content: '❌ La fecha del roster no puede ser más de 1 año en el futuro.',
                    ephemeral: true
                });
            }

            // Procesar fecha para Colombia
            const colombiaDate = DateUtils.toColombiaTime(rosterTimestamp);
            const dateStr = DateUtils.formatDateSpanish(colombiaDate);

            // Crear timestamp de tiempo
            const timeTimestamp = rosterTimestampStr.replace(':f>', ':t>');

            // Generar mensaje del roster
            const rosterMessage = CONFIG.ROSTER_TEMPLATE(dateStr, timeTimestamp);

            // Guardar reminder en la base de datos
            const reminder = new Reminder({
                userId: interaction.user.id,
                channelId: interaction.channelId,
                message: rosterMessage,
                timestamp: launchDate,
                messageType: 'roster',
                metadata: {
                    rosterDate: rosterDate,
                    colombiaDate: colombiaDate,
                    originalTimestamp: rosterTimestamp
                }
            });

            await reminder.save();

            // Respuesta exitosa con información detallada
            const successMessage = [
                '✅ **Roster programado exitosamente**',
                '',
                `📅 **Fecha del roster:** ${dateStr}`,
                `⏰ **Hora del roster:** ${CONFIG.ROSTER_TIME} Hora Server`,
                `🚀 **Se lanzará:** <t:${launchTimestamp}:f>`,
                '',
                'El mensaje se enviará automáticamente en el momento programado.'
            ].join('\n');

            await interaction.reply({
                content: successMessage,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error en comando roster:', error);
            
            // Mensaje de error más específico
            let errorMessage = '❌ Hubo un error al programar el roster.';
            
            if (error.name === 'ValidationError') {
                errorMessage = '❌ Error de validación en los datos proporcionados.';
            } else if (error.code === 11000) {
                errorMessage = '❌ Ya existe un roster programado para esa fecha.';
            } else if (error.message.includes('timestamp')) {
                errorMessage = '❌ Error en el formato de timestamp proporcionado.';
            }

            await interaction.reply({
                content: errorMessage,
                ephemeral: true
            });
        }
    },
}; 