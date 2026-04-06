const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const checkRole = require('../middleware/checkRole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cancelar')
        .setDescription('Cancela uno o varios recordatorios mediante su ID corto')
        .addStringOption(option =>
            option.setName('ids')
                .setDescription('IDs de los eventos a borrar (separados por espacio o coma)')
                .setRequired(true)),

    async execute(interaction) {
        // Check for role permission
        const hasPermission = await checkRole()(interaction);
        if (!hasPermission) return;

        const idsInput = interaction.options.getString('ids');
        const ids = idsInput.split(/[\s,]+/).map(id => id.toUpperCase().trim()).filter(id => id);

        if (ids.length === 0) {
            return interaction.reply({
                content: '❌ Por favor, proporciona al menos un ID válido.',
                ephemeral: true
            });
        }

        try {
            // Permite borrar tanto por shortId como fallback a _id viejo por si aún tienen que borrar uno pre-existente
            const validMongoIds = ids.filter(id => id.length === 24 && /^[0-9a-fA-F]{24}$/i.test(id));
            
            const query = {
                $or: [
                    { shortId: { $in: ids } }
                ],
                guildId: interaction.guildId || null
            };

            if (validMongoIds.length > 0) {
                query.$or.push({ _id: { $in: validMongoIds } });
            }

            const result = await Reminder.deleteMany(query);

            if (result.deletedCount === 0) {
                return interaction.reply({
                    content: '❌ No se encontró ningún recordatorio que pueda ser cancelado con esos IDs.',
                    ephemeral: true
                });
            }

            await interaction.reply({
                content: `✅ Se han cancelado exitosamente **${result.deletedCount}** recordatorio(s).`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in cancelar command:', error);
            await interaction.reply({
                content: '❌ Hubo un error procesando la orden de cancelación.',
                ephemeral: true
            });
        }
    },
};
