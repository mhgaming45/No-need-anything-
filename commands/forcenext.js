const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("forcenext")
        .setDescription("Force skip the current player")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        )
        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Select Gamemode")
                .setRequired(true)
                .addChoices(
                    { name: "UHC", value: "uhc" },
                    { name: "NethPot", value: "nethpot" },
                    { name: "Vanilla", value: "vanilla" },
                    { name: "SMP", value: "smp" },
                    { name: "Sword", value: "sword" },
                    { name: "Mace", value: "mace" },
                    { name: "Axe", value: "axe" }
                )
        ),

    async execute(interaction, client) {

        const gamemode =
            interaction.options.getString("gamemode");

        const db = load();

        if (!db.active_tests)
            db.active_tests = {};

        const active = db.active_tests[gamemode];

        if (!active) {

            return interaction.reply({

                content: "❌ No active player found.",

                ephemeral: true

            });

        }

        db.queue = db.queue.filter(
            q =>
                !(
                    q.userId === active.userId &&
                    q.gamemode === gamemode
                )
        );

        delete db.active_tests[gamemode];

        save(db);

        await updateQueue(client, gamemode);

        return interaction.reply({

            content:
                `✅ <@${active.userId}> has been skipped.\nUse **/next** to pick the next player.`,

            ephemeral: true

        });

    }

};