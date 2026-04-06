const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        default: null
    },
    guildName: {
        type: String,
        default: 'Desconocido'
    },
    channelName: {
        type: String,
        default: 'Desconocido'
    },
    shortId: {
        type: String,
        default: () => Math.random().toString(36).substring(2, 7).toUpperCase()
    },
    recurrence: {
        type: String,
        enum: ['none', 'diario', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
        default: 'none'
    },
    message: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        required: true
    },
    messageType: {
        type: String,
        enum: ['roster', 'reminder'],
        default: 'reminder'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reminder', reminderSchema); 