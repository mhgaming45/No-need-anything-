const { EmbedBuilder } = require("discord.js");
const { load, save } = require("../database/database");
const config = require("../config");
const updateQueue = require("../utils/updateQueue");

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
                content: "❌ Invalid Tier!",
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

        const previousTier = player.tier || "Unranked";

        player.tier = tier;
        player.wins = (player.wins || 0) + 1;

        const gamemode = player.gamemode;

        db.queue = db.queue.filter(
            q => q.userId !== userId
        );

        if (gamemode) {
            delete db.active_tests[gamemode];
        }

        save(db);

        const member = await interaction.guild.members
            .fetch(userId)
            .catch(() => null);

        if (member) {

            for (const roleId of Object.values(config.tierRoles)) {

                if (member.roles.cache.has(roleId)) {

                    await member.roles.remove(roleId).catch(() => {});

                }

            }

            if (config.tierRoles[tier]) {

                await member.roles
                    .add(config.tierRoles[tier])
                    .catch(() => {});

            }

        }

        if (gamemode) {
            await updateQueue(client, gamemode);
        }

        const resultChannel = interaction.guild.channels.cache.get(
            config.queueChannels.result
        );

        if (resultChannel) {

            const embed = new EmbedBuilder()

                .setColor("#FFD700")

                .setTitle(`🏆 ${player.ign}'s Tier Update`)

                .setThumbnail(
                    `https://mc-heads.net/avatar/${player.ign}/256`
                )

                .addFields(

                    {
                        name: "👤 Player",
                        value: `<@${userId}>`,
                        inline: false
                    },

                    {
                        name: "👨‍⚖️ Tester",
                        value: `<@${interaction.user.id}>`,
                        inline: false
                    },

                    {
                        name: "🎮 Minecraft Username",
                        value: player.ign,
                        inline: true
                    },

                    {
                        name: "⚔️ Game Mode",
                        value: player.gamemode || "Unknown",
                        inline: true
                    },

                    {
                        name: "📊 Previous Rank",
                        value: previousTier,
                        inline: true
                    },

                    {
                        name: "🏆 Rank Earned",
                        value: tier,
                        inline: true
                    }

                )

                .setFooter({
                    text: "⚡ Developed by MHGAMING"
                })

                .setTimestamp();

            await resultChannel.send({

                content: `<@${userId}>`,

                embeds: [embed]

            });

        }

        return interaction.reply({

            content:
`✅ Tier Updated Successfully!

👤 Player: <@${userId}>
🏆 New Tier: **${tier}**`,

            ephemeral: true

        });

    }

};