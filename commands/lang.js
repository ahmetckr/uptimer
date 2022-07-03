
const Discord = require("discord.js");
const fetch = require("node-fetch");

const config = require('../config.json')
const language = require("../lang.json");

const userModel = require("../models/user.js");

exports.run = async (client, message, args) => {
    const user = await userModel.findOne({ userID: message.author.id });
    var langFile = await (language[user?.lang?.toLowerCase?.()] ?? language["en"]);

    const options = await Object.keys(language).map(lang => {
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

        if(!langFormat[lang]) return { error: true};

        return {
            label: langFormat[lang].name,
            value: "selectLanguage."+message.author.id+"."+lang,
            emoji: {
                name: langFormat[lang].emoji,
            }
        };
    });


    const mg = await message.channel.send({
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: "selectLanguage."+message.author.id,
                placeholder: langFile.selectLanguage,
                min_values: 1,
                max_values: 1,
                options: options.filter(lang => !lang.error)
            }]
        }]
    });

    const filter = interaction => interaction.user.id == message.author.id;
    const collector = await mg.createMessageComponentCollector({ filter, time: 30000, type: "SELECT_MENU" });

    collector.on("end", async(collected) => {
        if(mg.editable) return mg.edit({ components: [{ type: 1, components: [{ type: 2, style: 4, disabled: true, custom_id: "closed", label: langFile.interactionClosed }]}]});
    });

    collector.on("collect", async(interaction) => {
        const pr = await interaction.customId.split(".")[0];
        const author = await interaction.customId.split(".")[1];
        
        if(pr !== "selectLanguage") return;

        await interaction.deferReply({ ephemeral: true});

        const vr = await interaction.values[0];
        const lang = await vr.split(".")[2];
        langFile = await (language[lang] ?? language["en"]);

        await userModel.findOneAndUpdate({ userID: interaction.user.id }, { lang: lang.toLowerCase() }, { upsert: true});
        return interaction.editReply({ content: "✅ | "+langFile.langSelected, ephemeral: true});
    });
};


module.exports.config = {
  name: 'lang',
  description: 'Choose your language.',
  aliases: ["dil", "language"]
};