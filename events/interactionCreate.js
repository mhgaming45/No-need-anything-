module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {

        try {

            // Slash Commands
            if (interaction.isChatInputCommand()) {

                const command = client.commands.get(interaction.commandName);

                if (!command) return;

                return await command.execute(interaction, client);

            }

            // Buttons
            if (interaction.isButton()) {

                const id = interaction.customId.split("_")[0];

                const button = client.buttons.get(id);

                if (!button) return;

                return await button.execute(interaction, client);

            }

            // Modals
            if (interaction.isModalSubmit()) {

                const id = interaction.customId.split("_")[0];

                const modal = client.modals.get(id);

                if (!modal) return;

                return await modal.execute(interaction, client);

            }

        } catch (err) {

            console.error(err);

            if (interaction.replied || interaction.deferred) {

                await interaction.followUp({
                    content: "❌ An error occurred.",
                    ephemeral: true
                }).catch(() => {});

            } else {

                await interaction.reply({
                    content: "❌ An error occurred.",
                    ephemeral: true
                }).catch(() => {});

            }

        }

    }

};