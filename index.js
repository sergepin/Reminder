const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const { getRandomPhrase } = require('./data/phrases');
const { getRandomGif } = require('./data/gifs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// Command collection
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Check for due reminders every minute
setInterval(async () => {
    try {
        const now = new Date();
        const dueReminders = await mongoose.model('Reminder').find({
            timestamp: { $lte: now }
        });

        for (const reminder of dueReminders) {
            const channel = await client.channels.fetch(reminder.channelId);
            if (channel) {
                if (reminder.messageType === 'roster') {
                    // Enviar mensaje de roster sin GIF
                    await channel.send({
                        content: reminder.message,
                        allowedMentions: { parse: ['everyone'] }
                    });
                } else {
                    // Enviar recordatorio normal con GIF
                    const randomPhrase = getRandomPhrase();
                    let reminderMessage = `${randomPhrase}\n\n ${reminder.message} @everyone`;
                    
                    // Si hay un messageId, intentar obtener y mostrar el mensaje original
                    if (reminder.messageId) {
                        try {
                            const originalMessage = await channel.messages.fetch(reminder.messageId);
                            if (originalMessage) {
                                // Eliminar @everyone del mensaje original
                                const cleanContent = originalMessage.content.replace(/@everyone\s*/i, '');
                                reminderMessage += `\n\n**Roster:**\n${cleanContent || '*(mensaje sin contenido)*'}`;
                            }
                        } catch (error) {
                            console.error('Error fetching original message:', error);
                            reminderMessage += '\n\n⚠️ No se pudo acceder al mensaje original.';
                        }
                    }

                    await channel.send({
                        content: reminderMessage,
                        files: [getRandomGif()]
                    });
                }
            }
            await reminder.deleteOne();
        }
    } catch (error) {
        console.error('Error checking reminders:', error);
    }
}, 60000);

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
        }
    }
});

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Login to Discord
client.login(process.env.TOKEN); 