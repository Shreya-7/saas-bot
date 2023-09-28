const { SlashCommandBuilder } = require("discord.js");
const { UniversalTodos } = require("../actions/universal-todos.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random-todo')
        .setDescription(UniversalTodos.description),
    async execute(interaction, channel) {
        const embed = await UniversalTodos.execute(interaction.client);
        await interaction.reply({ embeds: [embed] });
    }
}