const { SlashCommandBuilder, escapeNumberedList } = require("discord.js");
const { isMessageTodoDone, DONE_EMOJI } = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('todos')
        .setDescription(`Lists all pending (not reacted with ${DONE_EMOJI}) todo links from a channel (max 100)`),
    async execute(interaction, channel) {
        var todos = [];
        var errorFound = false;
        await channel.messages.fetch({ limit: 100 })
            .then(messages => {
                console.log(`Received ${messages.size} messages`);
                messages
                    .filter(message => (message.author.bot != true) && (message.content.includes('http')))
                    .filter(message => !isMessageTodoDone(message))
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