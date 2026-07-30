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
  EmbedBuilder
} = require("discord.js");

const config = require("./config/config.json");

const DB_FILE = "./database.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "{}");
  }

  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`${client.user.tag} is online!`);
});

client.on("interactionCreate", async (interaction) => {

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
    }

    return;
  }

  if (interaction.isButton() && interaction.customId === "register") {

    const modal = new ModalBuilder()
      .setCustomId("register_modal")
      .setTitle("Player Register");

    const ign = new TextInputBuilder()
      .setCustomId("ign")
      .setLabel("Minecraft Username")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const region = new TextInputBuilder()
      .setCustomId("region")
      .setLabel("Region")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const account = new TextInputBuilder()
      .setCustomId("account")
      .setLabel("Account Type (Premium / Cracked)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(ign),
      new ActionRowBuilder().addComponents(region),
      new ActionRowBuilder().addComponents(account)
    );

    return interaction.showModal(modal);
  }
  // Modal Submit
  if (interaction.isModalSubmit() && interaction.customId === "register_modal") {

    const ign = interaction.fields.getTextInputValue("ign");
    const region = interaction.fields.getTextInputValue("region");
    const account = interaction.fields.getTextInputValue("account");

    const db = loadDB();

    db[`user_${interaction.user.id}`] = {
      ign,
      region,
      account,
      gamemode: null
    };

    saveDB(db);

    try {
      await interaction.member.roles.add(config.queueRole);
    } catch (err) {
      console.log(err);
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
      content: "✅ Registration complete!\n\nNow choose your gamemode.",
      components: [row1, row2],
      ephemeral: true
    });
  }
// Gamemode Buttons
if (interaction.isButton()) {

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

  if (!gamemodes.includes(interaction.customId)) return;

  const db = loadDB();
  const data = db[`user_${interaction.user.id}`];

  if (!data) {
    return interaction.reply({
      content: "❌ Please register first.",
      ephemeral: true
    });
  }

  // Save Gamemode
  data.gamemode = interaction.customId;
  db[`user_${interaction.user.id}`] = data;
  saveDB(db);

  // Remove old gamemode roles
  for (const id of Object.values(config.roles)) {
    if (interaction.member.roles.cache.has(id)) {
      await interaction.member.roles.remove(id).catch(() => {});
    }
  }

  // Give selected role
  await interaction.member.roles
    .add(config.roles[interaction.customId])
    .catch(() => {});

  // Queue Channel
  const channel = client.channels.cache.get(
    queueChannels[interaction.customId]
  );

  if (channel) {

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📝 New Testing Queue")
      .addFields(
        { name: "Player", value: `<@${interaction.user.id}>` },
        { name: "IGN", value: data.ign, inline: true },
        { name: "Region", value: data.region, inline: true },
        { name: "Account", value: data.account, inline: true },
        {
          name: "Gamemode",
          value: interaction.customId.toUpperCase(),
          inline: true
        }
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`claim_${interaction.user.id}`)
        .setLabel("Claim")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`pass_${interaction.user.id}`)
        .setLabel("Pass")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`fail_${interaction.user.id}`)
        .setLabel("Fail")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      embeds: [embed],
      components: [row]
    });
  }

  return interaction.reply({
    content: `✅ You selected **${interaction.customId.toUpperCase()}**.\nYour request has been sent to the queue.`,
    ephemeral: true
  });
}
    // ================================
  // CLAIM / PASS / FAIL BUTTONS
  // ================================
  if (interaction.isButton()) {

    const [action, userId] = interaction.customId.split("_");

    if (!["claim", "pass", "fail"].includes(action)) return;

    // ================================
    // CLAIM
    // ================================
    if (action === "claim") {

      const claimedEmbed = interaction.message.embeds[0];

      const embed = EmbedBuilder.from(claimedEmbed)
        .setFooter({
          text: `Claimed by ${interaction.user.tag}`
        });

      const disabledButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`claim_${userId}`)
          .setLabel("Claimed")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId(`pass_${userId}`)
          .setLabel("Pass")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`fail_${userId}`)
          .setLabel("Fail")
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.update({
        embeds: [embed],
        components: [disabledButtons]
      });

      return;
    }

    // ================================
    // PASS BUTTON → OPEN MODAL
    // ================================
    if (action === "pass") {

      const modal = new ModalBuilder()
        .setCustomId(`pass_modal_${userId}`)
        .setTitle("Test Passed");

      const rankBefore = new TextInputBuilder()
        .setCustomId("rank_before")
        .setLabel("Rank Before")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Example: LT5")
        .setRequired(true);

      const rankEarned = new TextInputBuilder()
        .setCustomId("rank_earned")
        .setLabel("Rank Earned")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Example: HT4")
        .setRequired(true);

      const notes = new TextInputBuilder()
        .setCustomId("notes")
        .setLabel("Test Notes")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Enter test notes...")
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(rankBefore),
        new ActionRowBuilder().addComponents(rankEarned),
        new ActionRowBuilder().addComponents(notes)
      );

      return interaction.showModal(modal);
    }

    // ================================
    // FAIL BUTTON → OPEN MODAL
    // ================================
    if (action === "fail") {

      const modal = new ModalBuilder()
        .setCustomId(`fail_modal_${userId}`)
        .setTitle("Test Failed");

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Failure Reason")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Enter why the player failed...")
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(reason)
      );

      return interaction.showModal(modal);
    }
  }

  // ================================
  // PASS / FAIL MODAL SUBMIT
  // ================================
  if (interaction.isModalSubmit()) {

    // ================================
    // PASS MODAL
    // ================================
    if (interaction.customId.startsWith("pass_modal_")) {

      const userId = interaction.customId.replace("pass_modal_", "");

      const rankBefore =
        interaction.fields.getTextInputValue("rank_before");

      const rankEarned =
        interaction.fields.getTextInputValue("rank_earned");

      const notes =
        interaction.fields.getTextInputValue("notes") || "No notes provided.";

      const db = loadDB();
      const data = db[`user_${userId}`];

      if (!data) {
        return interaction.reply({
          content: "❌ Player data was not found.",
          ephemeral: true
        });
      }

      // Remove queue role
      try {
        const member =
          await interaction.guild.members.fetch(userId);

        await member.roles
          .remove(config.queueRole)
          .catch(() => {});
      } catch (err) {
        console.log("Queue role remove error:", err);
      }

      // Result channel
      const resultChannel =
        client.channels.cache.get(config.logChannel);

      if (resultChannel) {

        const resultEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(`🏆 ${data.ign}'s Test Results`)
          .addFields(
            {
              name: "Player Name",
              value: `<@${userId}>`,
              inline: false
            },
            {
              name: "Tester Name",
              value: `${interaction.user}`,
              inline: false
            },
            {
              name: "Rank Before",
              value: rankBefore,
              inline: true
            },
            {
              name: "Rank Earned",
              value: rankEarned,
              inline: true
            },
            {
              name: "Game Mode",
              value: data.gamemode
                ? data.gamemode.toUpperCase()
                : "Unknown",
              inline: true
            },
            {
              name: "Region",
              value: data.region || "Unknown",
              inline: true
            },
            {
              name: "Account",
              value: data.account || "Unknown",
              inline: true
            },
            {
              name: "Notes",
              value: notes,
              inline: false
            }
          )
          .setFooter({
            text: `Developer – Yi Chan`
          })
          .setTimestamp();

        await resultChannel.send({
          embeds: [resultEmbed]
        });
      }

      // Disable queue buttons
      try {

        const oldEmbed =
          interaction.message?.embeds?.[0];

        if (oldEmbed) {

          const finishedEmbed =
            EmbedBuilder.from(oldEmbed)
              .setColor("Green")
              .setFooter({
                text: `✅ Test Passed by ${interaction.user.tag}`
              });

          await interaction.message.edit({
            embeds: [finishedEmbed],
            components: []
          });
        }

      } catch (err) {
        console.log("Queue message update error:", err);
      }

      return interaction.reply({
        content:
          `✅ **${data.ign}** has been marked as **PASS**.\n\n🏆 Rank: **${rankEarned}**`,
        ephemeral: true
      });
    }

    // ================================
    // FAIL MODAL
    // ================================
    if (interaction.customId.startsWith("fail_modal_")) {

      const userId =
        interaction.customId.replace("fail_modal_", "");

      const reason =
        interaction.fields.getTextInputValue("reason");

      const db = loadDB();
      const data = db[`user_${userId}`];

      if (!data) {
        return interaction.reply({
          content: "❌ Player data was not found.",
          ephemeral: true
        });
      }

      // Remove queue role
      try {

        const member =
          await interaction.guild.members.fetch(userId);

        await member.roles
          .remove(config.queueRole)
          .catch(() => {});

      } catch (err) {
        console.log("Queue role remove error:", err);
      }

      // Result channel
      const resultChannel =
        client.channels.cache.get(config.logChannel);

      if (resultChannel) {

        const resultEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle(`❌ ${data.ign}'s Test Results`)
          .addFields(
            {
              name: "Player Name",
              value: `<@${userId}>`,
              inline: false
            },
            {
              name: "Tester Name",
              value: `${interaction.user}`,
              inline: false
            },
            {
              name: "Game Mode",
              value: data.gamemode
                ? data.gamemode.toUpperCase()
                : "Unknown",
              inline: true
            },
            {
              name: "Region",
              value: data.region || "Unknown",
              inline: true
            },
            {
              name: "Account",
              value: data.account || "Unknown",
              inline: true
            },
            {
              name: "Failure Reason",
              value: reason,
              inline: false
            }
          )
          .setFooter({
            text: `Developer – Yi Chan`
          })
          .setTimestamp();

        await resultChannel.send({
          embeds: [resultEmbed]
        });
      }

      // Disable queue buttons
      try {

        const oldEmbed =
          interaction.message?.embeds?.[0];

        if (oldEmbed) {

          const finishedEmbed =
            EmbedBuilder.from(oldEmbed)
              .setColor("Red")
              .setFooter({
                text: `❌ Test Failed by ${interaction.user.tag}`
              });

          await interaction.message.edit({
            embeds: [finishedEmbed],
            components: []
          });
        }

      } catch (err) {
        console.log("Queue message update error:", err);
      }

      return interaction.reply({
        content:
          `❌ **${data.ign}** has been marked as **FAIL**.\n\nReason: **${reason}**`,
        ephemeral: true
      });
    }
  }
});
client.login(process.env.TOKEN);

// Web Server
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot Online");
}).listen(process.env.PORT || 3000, () => {
  console.log("Web server started.");
});