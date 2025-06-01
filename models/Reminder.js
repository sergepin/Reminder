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