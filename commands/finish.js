const {
    SlashCommandBuilder
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("finish")
        .setDescription("Finish the current test")
        .setDefaultMemberPermissions("0"),

    async execute(interaction, client) {

        if (!interaction.member.permissions.has("ManageGuild")) {

            return interaction.reply({

                content: "❌ You don't have permission.",

                ephemeral: true

            });

        }

        const db = load();

        const activeModes = Object.keys(db.active_tests || {});

        if (activeModes.length === 0) {

            return interaction.reply({

                content: "❌ No active test found.",

                ephemeral: true

            });

        }

        const gamemode = activeModes.find(
            mode => db.active_tests[mode]?.testerId === interaction.user.id
        );

        if (!gamemode) {

            return interaction.reply({

                content: "❌ You are not testing anyone.",

                ephemeral: true

            });

        }

        delete db.active_tests[gamemode];

        save(db);

        await updateQueue(client, gamemode);

        return interaction.reply({

            content: `✅ ${gamemode.toUpperCase()} test has been finished.`,

            ephemeral: true

        });

    }

};