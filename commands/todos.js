const { SlashCommandBuilder, escapeNumberedList } = require("discord.js");

const doneEmoji = '👍';
module.exports = {
    data: new SlashCommandBuilder()
        .setName('todos')
        .setDescription('Lists all pending (not reacted with 👍) todo links from a channel (max 100)'),
    async execute(interaction, channel) {
        var todos = [];
        var errorFound = false;
        await channel.messages.fetch({ limit: 100 })
            .then(messages => {
                console.log(`Received ${messages.size} messages`);
                messages
                    .filter(message => (message.author.bot != true) && (message.content.includes('http')))
                    .filter(message => {
                        const messageReaction = message.reactions.resolve(doneEmoji);
                        console.log(`Message "${message.content}" by ${message.author.username} has reactions=${messageReaction == null}`)
                        if (messageReaction) {
                            return messageReaction.count < 1;
                        } else {
                            return true;
                        }
                    })
                    .forEach(message => todos.push([`- <${message.content}>`]));
            })
            .catch(error => {
                console.error(error);
                errorFound = true;
            });
        const response =
            errorFound ?
                'Some error occured 🥲'
                : todos.length > 0 ?
                    escapeNumberedList(todos.join('\n'))
                    : 'All caught up! 🥰';
        await interaction.reply(response);
    },
};