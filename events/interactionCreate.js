module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {

        // Slash Commands
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {

                await command.execute(interaction);

            } catch (err) {

                console.error(err);

                if (interaction.replied || interaction.deferred) {

                    interaction.followUp({
                        content: "❌ An error occurred while executing this command.",
                        ephemeral: true
                    });

                } else {

                    interaction.reply({
                        content: "❌ An error occurred while executing this command.",
                        ephemeral: true
                    });

                }

            }

            return;
        }

        // Buttons
        if (interaction.isButton()) {

            const button = client.buttons.get(interaction.customId);

            if (!button) return;

            try {

                await button.execute(interaction);

            } catch (err) {

                console.error(err);

                if (!interaction.replied) {

                    interaction.reply({
                        content: "❌ Button error.",
                        ephemeral: true
                    });

                }

            }

            return;
        }

        // Modals
        if (interaction.isModalSubmit()) {

            const modal = client.modals.get(interaction.customId);

            if (!modal) return;

            try {

                await modal.execute(interaction);

            } catch (err) {

                console.error(err);

                if (!interaction.replied) {

                    interaction.reply({
                        content: "❌ Modal error.",
                        ephemeral: true
                    });

                }

            }

        }

    }

};