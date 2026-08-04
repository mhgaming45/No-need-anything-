const {
    SlashCommandBuilder
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("forcenext")
        .setDescription("Force skip current player and take next player")
        .setDefaultMemberPermissions("0")
        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Select gamemode")
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

        if (!interaction.member.permissions.has("ManageGuild")) {
            return interaction.reply({
                content: "❌ You don't have permission.",
                ephemeral: true
            });
        }

        const gamemode = interaction.options.getString("gamemode");

        const db = load();

        if (!db.queue) db.queue = [];
        if (!db.active_tests) db.active_tests = {};

        // Remove current active test if exists
        delete db.active_tests[gamemode];

        const queue = db.queue
            .filter(q => q.gamemode === gamemode)
            .sort((a, b) => a.joinedAt - b.joinedAt);

        if (queue.length === 0) {

            save(db);

            await updateQueue(client, gamemode);

            return interaction.reply({
                content: `❌ No players are waiting in **${gamemode.toUpperCase()}** queue.`,
                ephemeral: true
            });
        }

        const player = queue[0];

        db.active_tests[gamemode] = {

            testerId: interaction.user.id,
            playerId: player.userId,
            startedAt: Date.now()

        };

        save(db);

        await updateQueue(client, gamemode);

        return interaction.reply({

            content:
`✅ Forced next player.

👤 Player: <@${player.userId}>
🎮 Gamemode: **${gamemode.toUpperCase()}**`,

            ephemeral: true

        });

    }

};