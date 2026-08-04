const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { load } = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("history")
        .setDescription("View a player's tier history")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Player")
                .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("user");

        const db = load();

        if (!db.history) db.history = [];

        const history = db.history.filter(
            h => h.userId === user.id
        );

        if (history.length === 0) {

            return interaction.reply({

                content: "❌ No history found.",

                ephemeral: true

            });

        }

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle(`${user.username}'s Tier History`)

            .setDescription(

                history
                    .reverse()
                    .slice(0, 15)
                    .map((h, i) =>

`${i + 1}. **${h.gamemode.toUpperCase()}**
Old Tier : ${h.oldTier || "None"}
New Tier : ${h.newTier}
Tester : <@${h.testerId}>
<t:${Math.floor(new Date(h.createdAt).getTime() / 1000)}:R>`

                    )
                    .join("\n\n")

            )

            .setFooter({

                text: "Developed By MHGAMING"

            })

            .setTimestamp();

        await interaction.reply({

            embeds: [embed]

        });

    }

};