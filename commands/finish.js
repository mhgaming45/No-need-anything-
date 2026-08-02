const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("finish")
        .setDescription("Finish a player's test")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Select player")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Gamemode")
                .setRequired(true)
                .addChoices(
                    { name: "NethPot", value: "nethpot" },
                    { name: "Vanilla", value: "vanilla" },
                    { name: "SMP", value: "smp" },
                    { name: "Sword", value: "sword" },
                    { name: "UHC", value: "uhc" },
                    { name: "Mace", value: "mace" },
                    { name: "Axe", value: "axe" }
                )
        )
        .addStringOption(option =>
            option
                .setName("tier")
                .setDescription("Assign Tier")
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
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction, client) {

        const member = interaction.options.getMember("player");
        const gamemode = interaction.options.getString("gamemode");
        const tier = interaction.options.getString("tier");

        db.prepare(`
        INSERT OR REPLACE INTO tiers
        (userId,gamemode,tier,updatedAt)
        VALUES(?,?,?,?)
        `).run(
            member.id,
            gamemode,
            tier,
            new Date().toISOString()
        );

        db.prepare(`
        DELETE FROM queue
        WHERE userId = ?
        `).run(member.id);

        const roleId = config.roles[tier.toLowerCase()];

        if (roleId) {

            const role = interaction.guild.roles.cache.get(roleId);

            if (role) {

                await member.roles.add(role).catch(() => {});

            }

        }

        await updateQueue(client, gamemode);

        const embed = new EmbedBuilder()

            .setColor("Green")

            .setTitle("✅ Test Finished")

            .setDescription(
                `${member} has been assigned **${tier}**.`
            )

            .setTimestamp();

        await interaction.reply({

            embeds: [embed]

        });

    }

};