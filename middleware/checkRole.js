require('dotenv').config();

const checkRole = () => {
    return async (interaction) => {
        // Separa los roles del .env por comas y quita espacios extra
        const allowedRoles = process.env.REQUIRED_ROLE.split(',').map(role => role.trim());
        
        // Verifica si el usuario tiene al menos uno de los roles permitidos
        const hasRole = interaction.member.roles.cache.some(role => allowedRoles.includes(role.name));
        
        if (!hasRole) {
            await interaction.reply({
                content: `No tienes permiso para usar este comando`,
                ephemeral: true
            });
            return false;
        }
        return true;
    };
};

module.exports = checkRole; 