const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');
const checkRole = require('../middleware/checkRole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ajustes')
        .setDescription('Configura las preferencias del bot en este servidor')
        // En Discord una opción de rol fuerza al usuario a escoger un @Rol válido del server.
        .addRoleOption(option =>
            option.setName('rol_mencion')
                .setDescription('El rol que el bot debe etiquetar cuando envíe los avisos.')
                .setRequired(false)),

    async execute(interaction) {
        // Validación de permisos (asegurarnos de que solo el rol preacordado hace esto)
        const hasPermission = await checkRole()(interaction);
        if (!hasPermission) return;

        // Discord Roles traen un string en id. Si está nulo, reseteamos a everyone
        const roleInput = interaction.options.getRole('rol_mencion');
        
        // Si el usuario elige un rol, el string será <@&ID>. Si no elige nada, resetea a @everyone.
        const roleToTag = roleInput ? `<@&${roleInput.id}>` : '@everyone';

        try {
            // Actualizamos o creamos la configuración usando upset
            await GuildConfig.findOneAndUpdate(
                { guildId: interaction.guildId },
                { 
                    roleToMention: roleToTag, 
                    updatedAt: Date.now() 
                },
                { upsert: true, new: true } // Upsert crea si no existe
            );

            // Respondemos de acuerdo al caso
            if (roleInput) {
                await interaction.reply({
                    content: `⚙️ ¡Ajuste guardado! En este servidor los avisos ahora etiquetarán a: ${roleToTag}`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `⚙️ ¡Ajuste reseteado! Los avisos volverán a etiquetar a: **@everyone**.\n(Para cambiarlo usa \`/ajustes @Rol\`)`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error guardando los ajustes:', error);
            await interaction.reply({
                content: '❌ Hubo un error guardando el archivo de configuración.',
                ephemeral: true
            });
        }
    },
};
