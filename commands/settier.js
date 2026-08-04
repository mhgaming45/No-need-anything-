const {
    SlashCommandBuilder
} = require("discord.js");

const { load, save } = require("../database/database");
const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("settier")
        .setDescription("Set a player's tier")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Select player")
                .setRequired(true)
        )
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
        )
        .addStringOption(option =>
            option
                .setName("tier")
                .setDescription("Select tier")
                .setRequired(true)
                .addChoices(
                    { name: "HT5", value: "HT5" },
                    { name: "HT4", value: "HT4" },
                    { name: "HT3", value: "HT3" },
                    { name: "HT2", value: "HT2" },
                    { name: "HT1", value: "HT1" },
                    { name: "LT1", value: "LT1" },
                    { name: "LT2", value: "LT2" },
                    { name: "LT3", value: "LT3" },
                    { name: "LT4", value: "LT4" },
                    { name: "LT5", value: "LT5" }
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
        const tier = interaction.options.getString("tier");

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

        db.tiers[user.id][gamemode] = tier;

        save(db);

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (member) {

            // Remove old tier roles
            for (const roleId of Object.values(config.tierRoles)) {

                if (member.roles.cache.has(roleId)) {

                    await member.roles.remove(roleId).catch(() => {});

                }

            }

            // Give new role
            const roleId = config.tierRoles[tier];

            if (roleId) {

                await member.roles.add(roleId).catch(() => {});

            }

        }

        await interaction.reply({

            content:
`✅ Successfully set **${user.username}** to **${tier}** in **${gamemode.toUpperCase()}**.`,

            ephemeral: true

        });

    }

};