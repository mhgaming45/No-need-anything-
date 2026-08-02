const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("history")
        .setDescription("View player tier history")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Player")
                .setRequired(false)
        ),

    async execute(interaction) {

        const user =
            interaction.options.getUser("player") ||
            interaction.user;

        const history = db.prepare(`
        SELECT *
        FROM history
        WHERE userId = ?
        ORDER BY id DESC
        LIMIT 10
        `).all(user.id);

        if (!history.length) {

            return interaction.reply({

                content: "❌ No history found.",

                ephemeral: true

            });

        }

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle(`📜 ${user.username}'s Tier History`)

            .setDescription(

                history.map(h =>

`🎮 **${h.gamemode.toUpperCase()}**
📉 ${h.oldTier}
➡
📈 ${h.newTier}

👨‍⚖️ <@${h.testerId}>

<t:${Math.floor(new Date(h.createdAt).getTime()/1000)}:R>
`

                ).join("\n━━━━━━━━━━━━━━\n")

            )

            .setThumbnail(user.displayAvatarURL())

            .setTimestamp();

        await interaction.reply({

            embeds: [embed]

        });

    }

};