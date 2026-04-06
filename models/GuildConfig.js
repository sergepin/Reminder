const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    roleToMention: {
        type: String,
        default: '@everyone',
        description: 'Puede ser @everyone, @here, o un formato de ID de rol <@&ROLE_ID>'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
