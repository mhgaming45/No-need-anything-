const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Show bot latency"),

    async execute(interaction, client) {

        const embed = new EmbedBuilder()

            .setColor("Green")

            .setTitle("🏓 Pong!")

            .addFields(

                {
                    name: "🤖 Bot Latency",
                    value: `${Date.now() - interaction.createdTimestamp}ms`,
                    inline: true
                },

                {
                    name: "🌐 API Latency",
                    value: `${Math.round(client.ws.ping)}ms`,
                    inline: true
                }

            )

            .setFooter({
                text: "Developed by MHGAMING"
            })

            .setTimestamp();

        await interaction.reply({

            embeds: [embed],

            ephemeral: true

        });

    }

};