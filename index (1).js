require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

const config = require("./config/config.json");

// ========================================
// DATABASE
// ========================================

const DB_FILE = "./database.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "{}");
  }

  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ========================================
// QUEUE CHANNELS
// ========================================

const queueChannels = {
  uhc: config.queueChannels.uhc,
  pot: config.queueChannels.pot,
  mace: config.queueChannels.mace,
  nethop: config.queueChannels.nethop,
  smp: config.queueChannels.smp,
  sword: config.queueChannels.sword,
  axe: config.queueChannels.axe,
  vanilla: config.queueChannels.vanilla,
  cart: config.queueChannels.cart
};

// ========================================
// LIVE QUEUES
// ========================================

const queues = {
  uhc: [],
  pot: [],
  mace: [],
  nethop: [],
  smp: [],
  sword: [],
  axe: [],
  vanilla: [],
  cart: []
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// ========================================
// LOAD COMMANDS
// ========================================

const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

  const command = require(
    path.join(commandsPath, file)
  );

  if (command.data && command.execute) {
    client.commands.set(
      command.data.name,
      command
    );
  }

}

// ========================================
// READY EVENT
// ========================================

client.once(Events.ClientReady, () => {

  console.log(`${client.user.tag} is online!`);

});

// ========================================
// INTERACTION CREATE
// ========================================

client.on("interactionCreate", async (interaction) => {

  // ========================================
  // SLASH COMMANDS
  // ========================================

  if (interaction.isChatInputCommand()) {

    const command = client.commands.get(
      interaction.commandName
    );

    if (!command) return;

    try {

      await command.execute(interaction);

    } catch (err) {

      console.error(err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ An error occurred while executing this command.",
          ephemeral: true
        });
      }

    }

    return;
  }
// ========================================
// REGISTER BUTTON
// ========================================

if (
  interaction.isButton() &&
  interaction.customId === "register"
) {

  const modal = new ModalBuilder()
    .setCustomId("register_modal")
    .setTitle("Player Registration");

  const ign = new TextInputBuilder()
    .setCustomId("ign")
    .setLabel("Minecraft Username")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const region = new TextInputBuilder()
    .setCustomId("region")
    .setLabel("Region")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("AS / EU / NA")
    .setRequired(true);

  const account = new TextInputBuilder()
    .setCustomId("account")
    .setLabel("Account Type")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Premium / Cracked")
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(ign),
    new ActionRowBuilder().addComponents(region),
    new ActionRowBuilder().addComponents(account)
  );

  return interaction.showModal(modal);

}

// ========================================
// REGISTER MODAL
// ========================================

if (
  interaction.isModalSubmit() &&
  interaction.customId === "register_modal"
) {

  const db = loadDB();

  db[`user_${interaction.user.id}`] = {
    ign: interaction.fields.getTextInputValue("ign"),
    region: interaction.fields.getTextInputValue("region"),
    account: interaction.fields.getTextInputValue("account"),
    gamemode: null,
    tier: null,
    wins: 0,
    losses: 0
  };

  saveDB(db);
  if (config.queueRole) {
    await interaction.member.roles
      .add(config.queueRole)
      .catch(() => {});
  }

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("uhc")
      .setLabel("UHC")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("pot")
      .setLabel("Pot")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("mace")
      .setLabel("Mace")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("nethop")
      .setLabel("NetHop")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("smp")
      .setLabel("SMP")
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("sword")
      .setLabel("Sword")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("axe")
      .setLabel("Axe")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("vanilla")
      .setLabel("Vanilla")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("cart")
      .setLabel("Cart")
      .setStyle(ButtonStyle.Secondary)
  );

  return interaction.reply({
    content:
      "✅ Registration completed successfully!\n\n🎮 Please select your gamemode.",
    components: [row1, row2],
    ephemeral: true
  });

}
// ========================================
// GAMEMODE BUTTONS
// ========================================

const gamemodes = [
  "uhc",
  "pot",
  "mace",
  "nethop",
  "smp",
  "sword",
  "axe",
  "vanilla",
  "cart"
];

if (
  interaction.isButton() &&
  gamemodes.includes(interaction.customId)
) {

  const db = loadDB();

  const data = db[`user_${interaction.user.id}`];

  if (!data) {
    return interaction.reply({
      content: "❌ Please register first.",
      ephemeral: true
    });
  }

  const mode = interaction.customId;

  data.gamemode = mode;

  saveDB(db);

  // Already in queue?
  if (queues[mode].includes(interaction.user.id)) {

    const position =
      queues[mode].indexOf(interaction.user.id) + 1;

    return interaction.reply({
      content:
        `❌ You are already in the **${mode.toUpperCase()}** queue.\n\n` +
        `📍 Position: **#${position}**`,
      ephemeral: true
    });

  }

  queues[mode].push(interaction.user.id);

  const position = queues[mode].length;

  const playersAhead = position - 1;

  // Send queue message

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Joined Queue")
        .setDescription(
          `🎮 **Gamemode:** ${mode.toUpperCase()}\n\n` +
          `📍 **Your Position:** #${position}\n` +
          `👥 **Players Ahead:** ${playersAhead}\n\n` +
          `Please wait for a tester.`
        )
    ],
    ephemeral: true
  });

  // Update queue channel

  const channel = client.channels.cache.get(queueChannels[mode]);

  if (channel) {

    const list = queues[mode]
      .map((id, index) => `${index + 1}. <@${id}>`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle(`${mode.toUpperCase()} Queue`)
      .setDescription(
        list || "No players in queue."
      );

    const messages = await channel.messages.fetch();

    const botMessage = messages.find(
      m => m.author.id === client.user.id
    );

    if (botMessage) {

      await botMessage.edit({
        embeds: [embed]
      });

    } else {

      await channel.send({
        embeds: [embed]
      });

    }

  }

  return;

}
// ========================================
// TESTER PANEL - NEXT PLAYER
// ========================================

if (
  interaction.isButton() &&
  interaction.customId === "next_player"
) {
if (
  !interaction.member.permissions.has("ManageGuild")
) {
  return interaction.reply({
    content: "❌ Only testers can use this button.",
    ephemeral: true
  });
}
  const mode = interaction.message.embeds[0]?.title
    ?.split(" ")[0]
    ?.toLowerCase();

  if (!mode || !queues[mode]) {
    return interaction.reply({
      content: "❌ Invalid queue.",
      ephemeral: true
    });
  }

  if (queues[mode].length === 0) {
    return interaction.reply({
      content: "❌ Queue is empty.",
      ephemeral: true
    });
  }

  const userId = queues[mode][0];

  const db = loadDB();
  const data = db[`user_${userId}`];

  if (!data) {
    queues[mode].shift();

    return interaction.reply({
      content: "❌ Player data not found.",
      ephemeral: true
    });
  }

  const row = new ActionRowBuilder().addComponents(

    new ButtonBuilder()
      .setCustomId(`pass_${userId}`)
      .setLabel("✅ PASS")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`fail_${userId}`)
      .setLabel("❌ FAIL")
      .setStyle(ButtonStyle.Danger)

  );

  return interaction.reply({

  embeds: [

    new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("🎯 Current Test")
      .setDescription(
        `👤 Player: <@${userId}>\n\n` +
        `IGN: **${data.ign}**\n` +
        `Region: **${data.region}**\n` +
        `Gamemode: **${mode.toUpperCase()}**`
      )

  ],

  components: [row],
  ephemeral: true

});

}

// ========================================
// PASS BUTTON
// ========================================

if (
  interaction.isButton() &&
  interaction.customId.startsWith("pass_")
) {

  if (
    !interaction.member.permissions.has(
      PermissionsBitField.Flags.ManageGuild
    )
  ) {
    return interaction.reply({
      content: "❌ Only testers can use this button.",
      ephemeral: true
    });
  }

  const userId = interaction.customId.replace("pass_", "");

  const modal = new ModalBuilder()
    .setCustomId(`tier_modal_${userId}`)
    .setTitle("Assign Tier");

  const tier = new TextInputBuilder()
    .setCustomId("tier")
    .setLabel("Enter Tier")
    .setPlaceholder("LT5, LT4, LT3, LT2, LT1, HT5, HT4, HT3, HT2, HT1")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(tier)
  );

  return interaction.showModal(modal);

}
// ========================================
// TIER MODAL
// ========================================

if (
  interaction.isModalSubmit() &&
  interaction.customId.startsWith("tier_modal_")
) {

  const userId = interaction.customId.replace(
    "tier_modal_",
    ""
  );

  const rankEarned = interaction.fields
    .getTextInputValue("tier")
    .toUpperCase();

  if (
    !config.tierRoles ||
    !config.tierRoles[rankEarned]
  ) {

    return interaction.reply({
      content:
        "❌ Invalid Tier.\nExample: LT5, LT4, LT3, LT2, LT1, HT5, HT4, HT3, HT2, HT1",
      ephemeral: true
    });

  }

  const db = loadDB();

  const data = db[`user_${userId}`];

  if (!data) {

    return interaction.reply({
      content: "❌ Player not found.",
      ephemeral: true
    });

  }

  const mode = data.gamemode;

  const member = await interaction.guild.members
    .fetch(userId)
    .catch(() => null);

  if (!member) {

    return interaction.reply({
      content: "❌ Member not found.",
      ephemeral: true
    });

  }

// Remove old tier roles
for (const roleId of Object.values(config.tierRoles)) {

  await member.roles
    .remove(roleId)
    .catch(() => {});

}

// Add new tier role
await member.roles
  .add(config.tierRoles[rankEarned])
  .catch(() => {});

// Remove player from queue
queues[mode] = queues[mode].filter(
  id => id !== userId
);

// Save tier
data.tier = rankEarned;
data.wins = (data.wins || 0) + 1;

db[`user_${userId}`] = data;

saveDB(db);
// ================================
// UPDATE QUEUE CHANNEL
// ================================

const channel = client.channels.cache.get(queueChannels[mode]);

if (channel) {

  const list = queues[mode]
    .map((id, i) => `${i + 1}. <@${id}>`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTitle(`${mode.toUpperCase()} Queue`)
    .setDescription(
      list || "No players in queue."
    );

  const messages = await channel.messages.fetch();

  const botMessage = messages.find(
    m => m.author.id === client.user.id
  );

  if (botMessage) {

    await botMessage.edit({
      embeds: [embed]
    });

  } else {

    await channel.send({
      embeds: [embed]
    });

  }

}

// ================================
// DM PLAYER
// ================================

const user = await client.users
  .fetch(userId)
  .catch(() => null);

if (user) {

  await user.send({
    embeds: [
      new EmbedBuilder()
        .setColor("Green")
        .setTitle("🎉 Test Passed")
        .setDescription(
          `🏆 Tier: **${rankEarned}**\n` +
          `🎮 Gamemode: **${mode.toUpperCase()}**`
        )
    ]
  }).catch(() => {});

}

// ================================
// REPLY TO TESTER
// ================================

return interaction.reply({
  content:
    `✅ **${data.ign}** passed!\n🏆 Tier Assigned: **${rankEarned}**`,
  ephemeral: true
});

}

// ========================================
// FAIL BUTTON
// ========================================

if (
  interaction.isButton() &&
  interaction.customId.startsWith("fail_")
) {

  const userId = interaction.customId.replace("fail_", "");

  const modal = new ModalBuilder()
    .setCustomId(`fail_modal_${userId}`)
    .setTitle("Fail Player");

  const reason = new TextInputBuilder()
    .setCustomId("reason")
    .setLabel("Reason")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Enter fail reason...")
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(reason)
  );

  return interaction.showModal(modal);

}

// ========================================
// FAIL MODAL
// ========================================

if (
  interaction.isModalSubmit() &&
  interaction.customId.startsWith("fail_modal_")
) {
if (
  !interaction.member.permissions.has("ManageGuild")
) {
  return interaction.reply({
    content: "❌ Only testers can use this button.",
    ephemeral: true
  });
}
  const userId = interaction.customId.replace(
    "fail_modal_",
    ""
  );

  const reason =
    interaction.fields.getTextInputValue("reason");

  const db = loadDB();

  const data = db[`user_${userId}`];

  if (!data) {

    return interaction.reply({
      content: "❌ Player not found.",
      ephemeral: true
    });

  }

  const mode = data.gamemode;

  // Remove from queue
  queues[mode] = queues[mode].filter(
    id => id !== userId
  );

  data.losses = (data.losses || 0) + 1;

  db[`user_${userId}`] = data;

  saveDB(db);
  // Update Queue Channel

  const channel = client.channels.cache.get(queueChannels[mode]);

  if (channel) {

    const list = queues[mode]
      .map((id, i) => `${i + 1}. <@${id}>`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(`${mode.toUpperCase()} Queue`)
      .setDescription(
        list || "No players in queue."
      );

    const messages = await channel.messages.fetch();

    const botMessage = messages.find(
      m => m.author.id === client.user.id
    );

    if (botMessage) {

      await botMessage.edit({
        embeds: [embed]
      });

    } else {

      await channel.send({
        embeds: [embed]
      });

    }

  }

  // DM Failed Player

  const user = await client.users
    .fetch(userId)
    .catch(() => null);

  if (user) {

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Test Failed")
          .setDescription(
            `Unfortunately, you did not pass.\n\n` +
            `🎮 Gamemode: **${mode.toUpperCase()}**\n` +
            `📝 Reason: **${reason}**`
          )
      ]
    }).catch(() => {});

  }

  return interaction.reply({
    content:
      `❌ **${data.ign}** has been marked as **FAIL**.\n\nReason: **${reason}**`,
    ephemeral: true
  });

}
// ================================
// KEEP ALIVE (Hosting)
// ================================

http
  .createServer((req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/plain"
    });
    res.end("Bot is running!");
  })
  .listen(process.env.PORT || 3000, () => {
    console.log("Web server started.");
  });

// ================================
// ERROR HANDLING
// ================================

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.login(process.env.TOKEN);