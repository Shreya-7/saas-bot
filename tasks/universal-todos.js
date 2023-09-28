const { UniversalTodos } = require("../actions/universal-todos.js");

module.exports = {
    name: UniversalTodos.name,
    description: UniversalTodos.description,
    frequency: "00 30 9 * * *",
    async execute(client) {
        console.log("Running the universal-todo task");
        const embed = await UniversalTodos.execute(client);
        // TODO: change this channelId to `daily-action-items` once home server is up
        client.channels.cache.get("1071483356438593607").send({ embeds: [embed] });
    },
};