
const Discord = require("discord.js");
const fetch = require("node-fetch");

const config = require('../config.json')
const language = require("../lang.json");

const userModel = require("../models/user.js");
const projectModel = require("../models/project.js");

exports.run = async (client, message, args) => {
    const user = await userModel.findOne({ userID: message.author.id });
    var langFile = await (language[user?.lang?.toLowerCase?.()] ?? language["en"]);
    
    const projects = await projectModel.find();
    
    const langFormat = {
        "tr": {
            name: "Türkçe",
            emoji: "🇹🇷",
        },
        "en": {
            name: "English",
            emoji: "🇺🇸"
        }
    };

    const lastUptime = await projects.sort((a, b) => new Date(b.lastHost).getTime()-new Date(a.lastHost).getTime())[0];

    await message.channel.send({
        embeds: [{
            title: langFile.stats,
            color: 0x1ec900,
            description: `
- ${langFile.developer}: ${config.owners.map(user => "**"+client.users.cache.get(user).tag+"**").join(" | ")}
- ${langFile.totalUsers}: **${client.users.cache.size}**
- ${langFile.totalCommands}: **${client.commands.size}**

- ${langFile.ping}: **${client.ws.ping}ms** 📶
- ${langFile.totalProjects}: **${projects.length}**
- ${langFile.lastUptime}: <t:${Math.floor(new Date(lastUptime.lastHost).getTime()/1000.00)}:R>
            `,
            footer: { text: message.author.username + " "+ langFile.requestedBy, icon_url: message.author.displayAvatarURL({ dynamic: true})}
        }]
    })
};

module.exports.config = {
  name: 'stats',
  description: 'Get bot stats.',
  aliases: ["botinfo", "info", "istatistik", "i"]
};