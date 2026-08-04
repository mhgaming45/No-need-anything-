const {
    SlashCommandBuilder
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

    async execute(interaction) {

        if (!interaction.member.permissions.has("ManageGuild")) {

            return interaction.reply({
                content: "❌ You don't have permission.",
                ephemeral: true
            });

        }

        const user = interaction.options.getUser("player");
        const gamemode = interaction.options.getString("gamemode");

        const db = load();

        if (!db.players[user.id]) {

            return interaction.reply({
                content: "❌ Player not registered.",
                ephemeral: true
            });

        }

        if (!db.tiers) db.tiers = {};

        if (!db.tiers[user.id]) {
            db.tiers[user.id] = {};
        }

        db.tiers[user.id][gamemode] = "Unranked";

        save(db);

        // Remove Discord tier roles
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (member) {

            for (const roleId of Object.values(config.tierRoles)) {

                if (member.roles.cache.has(roleId)) {

                    await member.roles.remove(roleId).catch(() => {});

                }

            }

        }

        await interaction.reply({

            content:
`✅ Successfully reset **${user.username}**'s **${gamemode.toUpperCase()}** tier.`,

            ephemeral: true

        });

    }

};