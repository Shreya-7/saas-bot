const cron = require('cron');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const { fetchFilesFromPath } = require('./utils');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    fireScheduledTasks();
});
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    console.log(`Fired interaction=${interaction.id} commandName=${interaction.commandName}`);

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} found!`);
        return;
    }
    if (interaction.replied || interaction.deferred) {
        console.warn(`interaction=${interaction.id} already in progress, 
            replied=${interaction.replied} deferred=${interaction.deferred}`);
        return;
    }
    try {
        const channel = client.channels.cache.get(interaction.channelId);
        await command.execute(interaction, channel);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(token);

client.commands = new Collection();

fetchFilesFromPath('commands').forEach(command => {
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command is missing a required "data" or "execute" property.`);
    }
})

function fireScheduledTasks() {
    fetchFilesFromPath('tasks').forEach(scheduledTask => {
        if ('name' in scheduledTask && 'execute' in scheduledTask && 'frequency' in scheduledTask) {
            let schedule = new cron.CronJob(scheduledTask.frequency, () => { scheduledTask.execute(client) });
            console.log(`Scheduling task="${scheduledTask.name}" which ${scheduledTask.description} at frequency ${scheduledTask.frequency}`);
            schedule.start();
        } else {
            console.log(`[WARNING] The task is missing a required "name" or "execute" or "frequency" property.`);
        }
    })
}