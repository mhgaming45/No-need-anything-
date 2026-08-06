const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const { load, save } = require("../database/database");
const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("resettier")
        .setDescription("Reset a player's tier")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Select Player")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("player");

        const db = load();

        if (!db.players[user.id]) {

            return interaction.reply({

                content: "❌ Player is not registered.",

                ephemeral: true

            });

        }

        db.players[user.id].tier = "Unranked";

        save(db);

        const member = await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);

        if (member) {

            for (const roleId of Object.values(config.roles)) {

                if (member.roles.cache.has(roleId)) {

                    await member.roles.remove(roleId).catch(() => {});

                }

            }

        }

        await interaction.reply({

            content:
`✅ Successfully reset **${user.username}**'s tier.

🏆 New Tier: **Unranked**`,

            ephemeral: true

        });

    }

};