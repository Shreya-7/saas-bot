const { SlashCommandBuilder, escapeNumberedList } = require("discord.js");
const { isMessageTodoDone, linkPresentInMessage, DONE_EMOJI } = require("../utils.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('todos')
        .setDescription(`Lists all pending (not reacted with ${DONE_EMOJI}) todo links from a channel (max 100)`)
        .addBooleanOption(option =>
            option.setName('all')
                .setDescription('Whether you want all todos (link and non-link based)')),
    async execute(interaction, channel) {
        var todos = [];
        var errorFound = false;
        await channel.messages.fetch({ limit: 100 })
            .then(messages => {
                console.log(`Received ${messages.size} messages`);
                messages
                    .filter(message => (message.author.bot != true))
                    .filter(message => interaction.options.getBoolean('all') || linkPresentInMessage(message))
                    .filter(message => !isMessageTodoDone(message))
                    .forEach(message => {
                        if (linkPresentInMessage(message)) {
                            todos.push([`- <${message.content}>`])
                        } else {
                            todos.push([`- ${message.content}`])
                        }
                    });
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