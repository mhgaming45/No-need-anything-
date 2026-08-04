const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");
const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("setupqueue")
        .setDescription("Setup Queue Panel")
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

        if (!interaction.member.permissions.has("ManageGuild")) {
            return interaction.reply({
                content: "❌ You don't have permission.",
                ephemeral: true
            });
        }

        const gamemode = interaction.options.getString("gamemode");

        const channelId = config.queueChannels[gamemode];

        if (!channelId) {
            return interaction.reply({
                content: "❌ Queue channel not found in config.",
                ephemeral: true
            });
        }

        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
            return interaction.reply({
                content: "❌ Queue channel not found.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.settings.embedColor)
            .setTitle(`${config.emojis[gamemode]} ${gamemode.toUpperCase()} Queue`)
            .setDescription("```No players in queue.```")
            .addFields(
                {
                    name: "🟢 Status",
                    value: "Open",
                    inline: true
                },
                {
                    name: "👨‍⚖️ Current Tester",
                    value: "None",
                    inline: true
                },
                {
                    name: "👤 Current Player",
                    value: "None",
                    inline: true
                },
                {
                    name: "Players",
                    value: "0",
                    inline: true
                }
            )
            .setFooter({
                text: "Developed by MHGAMING"
            })
            .setTimestamp();

        const msg = await channel.send({
            embeds: [embed]
        });

        const db = load();

        if (!db.queue_messages)
            db.queue_messages = {};

        db.queue_messages[gamemode] = {

            channelId: channel.id,
            messageId: msg.id

        };

        save(db);

        await updateQueue(client, gamemode);

        await interaction.reply({

            content: `✅ ${gamemode.toUpperCase()} Queue Panel Created.`,

            ephemeral: true

        });

    }

};