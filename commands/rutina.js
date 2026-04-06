const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const checkRole = require('../middleware/checkRole');

function getNextOccurrence(horaStr, frecuencia) {
    const [h, m] = horaStr.split(':').map(Number);
    const now = new Date();
    const TIMEZONE_OFFSET = -5;
    
    // Obtener UTC en milisegundos y sumarle el offset (zona Colombia)
    const currentUTC = now.getTime() + (now.getTimezoneOffset() * 60000);
    const currentDate = new Date(currentUTC + (3600000 * TIMEZONE_OFFSET));

    const nextDate = new Date(currentDate);
    nextDate.setHours(h, m, 0, 0);

    // Si ya pasó esa hora de hoy, saltamos al día siguiente
    if (nextDate.getTime() <= currentDate.getTime()) {
        nextDate.setDate(nextDate.getDate() + 1);
    }

    const dayMap = {
        'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3,
        'jueves': 4, 'viernes': 5, 'sabado': 6
    };

    if (frecuencia !== 'diario') {
        const targetDay = dayMap[frecuencia];
        // Adicionar días hasta coincidir con el día deseado
        while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
    }

    // Convertir de vuelta la fecha conceptual a UTC verdadero para guardado en DB
    return new Date(nextDate.getTime() - (3600000 * TIMEZONE_OFFSET));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rutina')
        .setDescription('Programa un mensaje recurrente automáticamente')
        .addStringOption(option => option.setName('mensaje').setDescription('Mensaje a enviar cada que aplique').setRequired(true))
        .addStringOption(option => option.setName('hora').setDescription('Hora en formato de Colombia HH:MM (ej. 20:30)').setRequired(true))
        .addStringOption(option => 
            option.setName('frecuencia')
                .setDescription('¿Exáctamente cuándo y qué tan frecuente?')
                .setRequired(true)
                .addChoices(
                    { name: 'Diario (Todos los días a esa hora)', value: 'diario' },
                    { name: 'Cada Lunes', value: 'lunes' },
                    { name: 'Cada Martes', value: 'martes' },
                    { name: 'Cada Miércoles', value: 'miercoles' },
                    { name: 'Cada Jueves', value: 'jueves' },
                    { name: 'Cada Viernes', value: 'viernes' },
                    { name: 'Cada Sábado', value: 'sabado' },
                    { name: 'Cada Domingo', value: 'domingo' }
                )),

    async execute(interaction) {
        const hasPermission = await checkRole()(interaction);
        if (!hasPermission) return;

        const mensaje = interaction.options.getString('mensaje');
        const horaStr = interaction.options.getString('hora');
        const frecuencia = interaction.options.getString('frecuencia');

        if (!/^\d{1,2}:\d{2}$/.test(horaStr)) {
            return interaction.reply({ content: '❌ La hora debe estar en estricto formato de 24h: HH:MM (ej. 14:30)', ephemeral: true });
        }

        try {
            const firstExecution = getNextOccurrence(horaStr, frecuencia);
            
            const reminder = new Reminder({
                userId: interaction.user.id,
                channelId: interaction.channelId,
                guildId: interaction.guildId || null,
                guildName: interaction.guild?.name || 'DM',
                channelName: interaction.channel?.name || 'DM',
                message: mensaje,
                timestamp: firstExecution,
                recurrence: frecuencia
            });

            await reminder.save();

            const timestamp = Math.floor(firstExecution.getTime() / 1000);
            await interaction.reply({
                content: `🚀 **Rutina \`${frecuencia}\` a las \`${horaStr}\` programada exitosamente.**\n\n📍 **Siguiente publicación:** <t:${timestamp}:F> (<t:${timestamp}:R>)\n🪪 **ID Corto:** \`${reminder.shortId}\` (guárdalo por si deseas cancelar con \`/cancelar\`)`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error programando rutina:', error);
            await interaction.reply({ content: '❌ Hubo un error procesando el guardado de la rutina periódica.', ephemeral: true });
        }
    }
};
