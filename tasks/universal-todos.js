const { UniversalTodos } = require("../actions/universal-todos.js");

module.exports = {
    name: UniversalTodos.name,
    description: UniversalTodos.description,
    frequency: "00 18 * * *",
    async execute(client) {
        console.log("Running the universal-todo task");
        const embed = await UniversalTodos.execute(client);
        client.channels.cache.get("1058063473722015778").send({ embeds: [embed] });
    },
};