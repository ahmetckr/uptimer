
const Discord = require("discord.js");
const fetch = require("node-fetch");

const config = require('../config.json')
const language = require("../lang.json");

const userModel = require("../models/user.js");

exports.run = async (client, message, args) => {
    const user = await userModel.findOne({ userID: message.author.id });
    var langFile = await (language[user?.lang?.toLowerCase?.()] ?? language["en"]);
    
    
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


const langf = await (langFormat[user?.lang?.toLowerCase?.()] ?? langFormat["en"]);

await message.channel.send({
    embeds: [{
        title: langFile.helpMenu,
        color: 0x1ec900,
        description: `
${langFile.helpWelcome} ${message.author.username}.

- ${langFile.helpDetail}

> ${langFile.language} ${langf.emoji} ${langf.name}
- ${langFile.setLang}

${langFile.commands} (${client.commands.size-1})
${client.commands.filter(cmd => cmd.config.name !== "eval").map(cmd => "`"+cmd.config.name+"`").join(", ")}
`,
        footer: { text: message.author.username + " "+ langFile.requestedBy, icon_url: message.author.displayAvatarURL({ dynamic: true})}
}]
});

};

module.exports.config = {
  name: 'help',
  description: 'Get help from Uptimer.',
  aliases: ["yardım", "commands", "komutlar"]
};