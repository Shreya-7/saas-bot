const { EmbedBuilder } = require("discord.js");
const { isMessageTodoDone, DONE_EMOJI } = require("../utils.js");

module.exports = {
    name: "Returns a random link out of all (not reacted with ${DONE_EMOJI}) todo links from all educational channels",
    frequency: "00 30 9 * * *",
    async execute(client, numOfLinks) {
        console.log("Running the universal-todo task");
        const educationalCategoryIds = [
            "1059435054092259459",
            "1059435267020304404",
            "1059435427175612526",
            "1059435977338257439",
            "1059445454779195462"
        ]
        var messagesInRandomChannel = [];
        var errorFound = false;

        var channels = [];
        educationalCategoryIds.forEach(categoryId => {
            const channelsInCategory = client.channels.cache.get(categoryId).children.cache;
            channels.push(...channelsInCategory);
        })

        // to account for channels having no links or no unread links
        while (messagesInRandomChannel.length == 0) {
            const randomChannel = channels[Math.floor(Math.random() * channels.length)].at(1);

            await randomChannel.messages.fetch({ limit: 100 })
                .then(messages => {
                    console.log(`Received ${messages.size} messages in channel ${randomChannel.name}`);
                    messages
                        .filter(message => (message.author.bot != true) && (message.content.includes('http')))
                        .filter(message => !isMessageTodoDone(message))
                        .forEach(message => messagesInRandomChannel.push(message));
                })
                .catch(error => {
                    console.error(error);
                    errorFound = true;
                });
        }

        const randomMessage = messagesInRandomChannel[Math.floor(Math.random() * messagesInRandomChannel.length)];

        const embed = new EmbedBuilder()
            .setColor(0xfcbd31)
            .setURL(randomMessage.url)
            .setDescription(randomMessage.content)
            .setTitle('Unread link of the day');

        client.channels.cache.get("1071483356438593607").send({ embeds: [embed] });
    },
};