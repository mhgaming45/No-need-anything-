const { ActivityType } = require("discord.js");

module.exports = {

    name: "ready",
    once: true,

    async execute(client) {

        console.log("=================================");
        console.log(`✅ Logged in as ${client.user.tag}`);
        console.log(`🌍 Servers : ${client.guilds.cache.size}`);
        console.log("=================================");

        client.user.setPresence({

            status: "online",

            activities: [
                {
                    name: "Professional Tier Testing",
                    type: ActivityType.Watching
                }
            ]

        });

        console.log("✅ Bot Ready!");

    }

};