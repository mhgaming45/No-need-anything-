const {
    ActivityType
} = require("discord.js");

module.exports = {

    name: "ready",
    once: true,

    async execute(client) {

        console.log("====================================");
        console.log(`✅ Logged in as ${client.user.tag}`);
        console.log(`✅ Guilds: ${client.guilds.cache.size}`);
        console.log("====================================");

        client.user.setPresence({

            activities: [

                {

                    name: "Professional Tier Testing",
                    type: ActivityType.Watching

                }

            ],

            status: "online"

        });

    }

};