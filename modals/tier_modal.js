const {
    EmbedBuilder
} = require("discord.js");

const {
    load,
    save
} = require("../database/database");

const config = require("../config");

module.exports = {

    id: "tiermodal",

    async execute(interaction, client) {

        const userId = interaction.customId.split("_")[1];

        const tier = interaction.fields
            .getTextInputValue("tier")
            .toUpperCase();

        const validTiers = [
            "HT5",
            "HT4",
            "HT3",
            "HT2",
            "HT1",
            "LT1",
            "LT2",
            "LT3",
            "LT4",
            "LT5"
        ];

        if (!validTiers.includes(tier)) {
            return interaction.reply({
                content: "❌ Invalid Tier.",
                ephemeral: true
            });
        }

        const db = load();

        if (!db.players[userId]) {
            return interaction.reply({
                content: "❌ Player not found.",
                ephemeral: true
            });
        }

        const player = db.players[userId];

        const oldTier = player.tier || "Unranked";

        player.tier = tier;

        save(db);

        const member = await interaction.guild.members
            .fetch(userId)
            .catch(() => null);

        if (member) {

            for (const roleId of Object.values(config.roles)) {

                if (member.roles.cache.has(roleId)) {

                    await member.roles.remove(roleId).catch(() => {});

                }

            }

            if (config.roles[tier]) {

                await member.roles
                    .add(config.roles[tier])
                    .catch(() => {});

            }

        }

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("🏆 Tier Assigned")
            .addFields(
                {
                    name: "Player",
                    value: `<@${userId}>`,
                    inline: true
                },
                {
                    name: "Previous Tier",
                    value: oldTier,
                    inline: true
                },
                {
                    name: "New Tier",
                    value: tier,
                    inline: true
                },
                {
                    name: "Tester",
                    value: `<@${interaction.user.id}>`,
                    inline: false
                }
            )
            .setFooter({
                text: "⚡ Developed by MHGAMING"
            })
            .setTimestamp();

        const resultChannel = interaction.guild.channels.cache.get(
            config.channels.results
        );

        if (resultChannel) {

            await resultChannel.send({
                content: `<@${userId}>`,
                embeds: [embed]
            });

        }

        await interaction.reply({

            content: `✅ **${player.ign}** has been assigned **${tier}**.`,

            ephemeral: true

        });

    }

};