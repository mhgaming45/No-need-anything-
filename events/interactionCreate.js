module.exports = {

    name: "interactionCreate",

    async execute(interaction, client) {

        // Slash Commands
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {

                await command.execute(interaction, client);

            } catch (err) {

                console.error(err);

                if (interaction.replied || interaction.deferred) {

                    await interaction.followUp({
                        content: "❌ An error occurred while executing this command.",
                        ephemeral: true
                    });

                } else {

                    await interaction.reply({
                        content: "❌ An error occurred while executing this command.",
                        ephemeral: true
                    });

                }

            }

            return;

        }

        // Buttons
        if (interaction.isButton()) {

            const id = interaction.customId.split("_")[0];

            const button = client.buttons.get(id);

            if (!button) return;

            try {

                await button.execute(interaction, client);

            } catch (err) {

                console.error(err);

                if (!interaction.replied) {

                    await interaction.reply({
                        content: "❌ Button error.",
                        ephemeral: true
                    });

                }

            }

            return;

        }

        // Modals
        if (interaction.isModalSubmit()) {

            const id = interaction.customId.split("_")[0];

            const modal = client.modals.get(id);

            if (!modal) return;

            try {

                await modal.execute(interaction, client);

            } catch (err) {

                console.error(err);

                if (!interaction.replied) {

                    await interaction.reply({
                        content: "❌ Modal error.",
                        ephemeral: true
                    });

                }

            }

        }

    }

};