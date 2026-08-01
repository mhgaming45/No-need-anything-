const {
    SlashCommandBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check Bot Ping"),

    async execute(interaction) {

        await interaction.reply({
            content: "🏓 Pong!"
        });

    }

};