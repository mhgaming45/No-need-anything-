module.exports = {

    name: "interactionCreate",

    async execute(interaction, client) {

        // =========================
        // SLASH COMMANDS
        // =========================

        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {

                await command.execute(interaction, client);

            } catch (err) {

                console.error(err);

                if (interaction.replied || interaction.deferred) {

                    await interaction.followUp({
                        content: "❌ Command Error.",
                        ephemeral: true
                    });

                } else {

                    await interaction.reply({
                        content: "❌ Command Error.",
                        ephemeral: true
                    });

                }

            }

            return;

        }

        // =========================
        // BUTTONS
        // =========================

        if (interaction.isButton()) {

            let button = client.buttons.get(interaction.customId);

            // queue_uhc, queue_sword...
            if (!button && interaction.customId.startsWith("queue_")) {
                button = client.buttons.get("queue");
            }

            // pass_uhc_userid
            if (!button && interaction.customId.startsWith("pass_")) {
                button = client.buttons.get("pass");
            }

            // fail_uhc_userid
            if (!button && interaction.customId.startsWith("fail_")) {
                button = client.buttons.get("fail");
            }

            // set_tier_uhc_userid
            if (!button && interaction.customId.startsWith("set_tier_")) {
                button = client.buttons.get("set_tier");
            }

            if (!button) return;

            try {

                await button.execute(interaction, client);

            } catch (err) {

                console.error(err);

                if (!interaction.replied) {

                    await interaction.reply({

                        content: "❌ Button Error.",

                        ephemeral: true

                    });

                }

            }

            return;

        }

        // =========================
        // MODALS
        // =========================

        if (interaction.isModalSubmit()) {

            let modal = client.modals.get(interaction.customId);

            // register_modal
            if (!modal && interaction.customId === "register_modal") {
                modal = client.modals.get("register_modal");
            }

            // tier_modal_uhc_123456789
            if (!modal && interaction.customId.startsWith("tier_modal_")) {
                modal = client.modals.get("tier_modal");
            }

            if (!modal) return;

            try {

                await modal.execute(interaction, client);

            } catch (err) {

                console.error(err);

                if (!interaction.replied) {

                    await interaction.reply({

                        content: "❌ Modal Error.",

                        ephemeral: true

                    });

                }

            }

        }

    }

};