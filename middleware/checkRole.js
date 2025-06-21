require('dotenv').config();

const checkRole = () => {
    return async (interaction) => {
        const hasRole = interaction.member.roles.cache.some(role => role.name === process.env.REQUIRED_ROLE);
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