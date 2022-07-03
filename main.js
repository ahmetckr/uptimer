const config = require("./config.json");
const language = require("./lang.json");
const fs = require("fs");
const mongoose = require("mongoose");

const Discord = require("discord.js");
const { Permissions, Intents } = require("discord.js");
const client = new Discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
  partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "GUILD_SCHEDULED_EVENT"]
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

client.login(config.token);

mongoose.connect(config.mongoURL, {
useNewUrlParser: true,
useUnifiedTopology: true
})

mongoose.connection.on("open", async() => {
  console.log("Connected with database!");

  const projectModel = require("./models/project");
  const userModel = require("./models/user.js");
  setInterval(async() => {
  const projects = await projectModel.find();

  await projects.forEach(project => {

    const fetch = require("node-fetch");

    trycatch = async() => {
      try {
        const d1 = await Date.now();
        fetch(project.url);
        const d2 = await Date.now();
        const ms = d2-d1
  
        await projectModel.findOneAndUpdate({ userID: project.userID, url: project.url}, { $inc: { totalHost: 1}, $set: { lastHost: new Date(), lastPing: ms }}, { upsert: true});
      } catch(err) {
        const userData = await userModel.findOne({ userID: project.userID });
        const user = await client.users.cache.get(project.userID);
        const langFile = await (language[user?.lang?.toLowerCase?.()] ?? language["en"]);

        return user?.send("❌ | "+langFile.notUptimedProject+" "+project.url);
      }
    };

    trycatch();
  })
  }, 300 * 1000)
})

fs.readdir("./commands/", (err, files) => {
  if(err) console.error(err);
  console.log(`${files.length} commands preparing.`);

  files.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    
    if(files.length == (i+1)) console.log("All commands prepared.");

    client.commands.set(props.config.name, props);
    props.config.aliases.forEach(alias => {
      client.aliases.set(alias, props.config.name);
    });
  });

});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];

      var cmd = require(`./commands/${command}`);

      client.commands.delete(command);

      client.aliases.forEach((cmd, alias) => {
        if(cmd === command) client.aliases.delete(alias);
      });

      client.commands.set(command, cmd);

      cmd.config.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.config.name);
      });

      resolve();

    } catch (e) {
      reject(e);
    }
  });
};


client.on("ready", () => {
  client.user.setStatus("idle");
  client.user.setActivity("Uptimer ready for add project. ", { type: "WATCHING"});
  console.log("Running bot.")
});

client.on("messageCreate", async(message) => {
if(message.author.bot) return;
if(!message.content.startsWith(config.prefix)) return;

const command = await message.content.split(" ")[0].slice(config.prefix.length);
const args = await message.content.split(" ").slice(1);

const cmd = await client.commands.get(command) || client.commands.get(client.aliases.get(command));

if(cmd) {
  cmd.run(client, message, args);
};
});


const { User } = require("discord.js");
const projectModel = require("./models/project.js");

User.prototype.getProjects = async() => {
const user = this;
const data = await projectModel.find({ userID: user.id }) ?? [];
console.log(user, data)
return data;
};
