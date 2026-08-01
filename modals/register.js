const {
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    id: "register_modal",

    async execute(interaction) {

        const ign = interaction.fields.getTextInputValue("ign");
        const region = interaction.fields.getTextInputValue("region");
        const age = interaction.fields.getTextInputValue("age");
        const country = interaction.fields.getTextInputValue("country");

        const avatar = interaction.user.displayAvatarURL({
            extension: "png",
            size: 1024
        });

        db.prepare(`
        INSERT OR REPLACE INTO players
        (
            userId,
            username,
            displayName,
            avatar,
            ign,
            region,
            age,
            country,
            elo,
            wins,
            losses,
            registeredAt
        )
        VALUES
        (
            ?,?,?,?,?,?,?,?,?,?,?,?
        )
        `).run(

            interaction.user.id,
            interaction.user.username,
            interaction.member.displayName,
            avatar,

            ign,
            region,
            age,
            country,

            1000,
            0,
            0,

            new Date().toISOString()

        );

        const embed = new EmbedBuilder()

            .setColor("Green")

            .setTitle("✅ Registration Successful")

            .setThumbnail(avatar)

            .addFields(

                {
                    name: "Minecraft IGN",
                    value: ign,
                    inline: true
                },

                {
                    name: "Region",
                    value: region,
                    inline: true
                },

                {
                    name: "Age",
                    value: age,
                    inline: true
                },

                {
                    name: "Country",
                    value: country,
                    inline: true
                },

                {
                    name: "Starting ELO",
                    value: "1000",
                    inline: true
                }

            )

            .setFooter({
                text: "Professional Tier Testing Bot"
            })

            .setTimestamp();

        await interaction.reply({

            embeds: [embed],

            ephemeral: true

        });

    }

};