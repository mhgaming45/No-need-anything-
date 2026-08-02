const { Events, ActivityType } = require("discord.js");
const updateQueue = require("../utils/updateQueue");
const config = require("../config");

module.exports = {

    name: Events.ClientReady,

    once: true,

    async execute(client) {

        console.log(`✅ Logged in as ${client.user.tag}`);

        client.user.setPresence({

            activities: [
                {
                    name: "Professional Tier Testing",
                    type: ActivityType.Watching
                }
            ],

            status: "online"

        });

        // Update all queue panels after restart
        for (const gamemode of config.gamemodes) {

            try {

                await updateQueue(client, gamemode);

            } catch (err) {

                console.log(`Failed to update ${gamemode} queue.`);

            }

        }

        console.log("✅ All Queue Panels Updated.");

    }

};