const { Events } = require("discord.js");

module.exports = {

    name: Events.InteractionCreate,

    async execute(interaction, client) {

        try {

            // ===========================
            // SLASH COMMANDS
            // ===========================

            if (interaction.isChatInputCommand()) {

                const command = client.commands.get(
                    interaction.commandName
                );

                if (!command) return;

                await command.execute(
                    interaction,
                    client
                );

            }

            // ===========================
            // BUTTONS
            // ===========================

            if (interaction.isButton()) {

                // Register Button
                if (interaction.customId === "register") {

                    const button =
                        client.buttons.get("register");

                    if (button)
                        return button.execute(
                            interaction,
                            client
                        );

                }

                // Leave Queue
                if (interaction.customId === "leave_queue") {

                    const button =
                        client.buttons.get("leave_queue");

                    if (button)
                        return button.execute(
                            interaction,
                            client
                        );

                }

                // Queue Buttons
                if (
                    interaction.customId.startsWith("queue_")
                ) {

                    const button =
                        client.buttons.get("queue");

                    if (button)
                        return button.execute(
                            interaction,
                            client
                        );

                }

            }

            // ===========================
            // MODALS
            // ===========================

            if (interaction.isModalSubmit()) {

                const modal =
                    client.modals.get(
                        interaction.customId
                    );

                if (!modal) return;

                await modal.execute(
                    interaction,
                    client
                );

            }

        } catch (err) {

            console.error(err);

            if (
                interaction.deferred ||
                interaction.replied
            ) {

                await interaction
                    .followUp({

                        content:
                            "❌ An unexpected error occurred.",

                        ephemeral: true

                    })
                    .catch(() => {});

            } else {

                await interaction
                    .reply({

                        content:
                            "❌ An unexpected error occurred.",

                        ephemeral: true

                    })
                    .catch(() => {});

            }

        }

    }

};