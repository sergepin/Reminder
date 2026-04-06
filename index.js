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

        if (dueReminders.length > 0) {
            // Se importa la configuración para leer el role
            const GuildConfig = require('./models/GuildConfig');
            
            await Promise.allSettled(dueReminders.map(async (reminder) => {
                try {
                    const channel = await client.channels.fetch(reminder.channelId);
                    if (channel) {
                        // Obtener config del servidor
                        let roleToMention = '@everyone';
                        if (channel.guild) {
                            const config = await GuildConfig.findOne({ guildId: channel.guild.id });
                            if (config) roleToMention = config.roleToMention;
                        }

                        if (reminder.messageType === 'roster') {
                            // Enviar mensaje de roster con MENCION
                            const rosterContent = reminder.message.replace(/{{MENTION}}|@everyone/g, roleToMention);
                            await channel.send({
                                content: rosterContent,
                                allowedMentions: { parse: ['everyone', 'roles'] }
                            });
                        } else {
                            // Enviar recordatorio normal con GIF
                            const randomPhrase = getRandomPhrase();
                            let reminderMessage = `${randomPhrase}\n\n ${reminder.message} ${roleToMention}`;
                            
                            if (reminder.messageId) {
                                try {
                                    const originalMessage = await channel.messages.fetch(reminder.messageId);
                                    if (originalMessage) {
                                        const cleanContent = originalMessage.content.replace(/(@everyone|<@&\d+>)\s*/gi, '').replace(/{{MENTION}}\s*/gi, '');
                                        reminderMessage += `\n\n**Roster:**\n${cleanContent || '*(mensaje sin contenido)*'}`;
                                    }
                                } catch (error) {
                                    console.error('Error fetching original message:', error);
                                    reminderMessage += '\n\n⚠️ No se pudo acceder al mensaje original.';
                                }
                            }

                            reminderMessage += `\n${getRandomGif()}`;

                            await channel.send({
                                content: reminderMessage,
                                allowedMentions: { parse: ['everyone', 'roles'] }
                            });
                        }
                    }

                    // Lógica de Repetición o Eliminación
                    if (!reminder.recurrence || reminder.recurrence === 'none') {
                        await reminder.deleteOne();
                    } else {
                        const nextDate = new Date(reminder.timestamp);
                        if (reminder.recurrence === 'diario') {
                            nextDate.setDate(nextDate.getDate() + 1);
                        } else {
                            nextDate.setDate(nextDate.getDate() + 7);
                        }
                        reminder.timestamp = nextDate;
                        await reminder.save();
                    }
                } catch (err) {
                    console.error('Error procesando un recordatorio específico:', err);
                }
            }));
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