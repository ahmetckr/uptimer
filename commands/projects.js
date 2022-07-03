
const Discord = require("discord.js");
const fetch = require("node-fetch");

const config = require('../config.json')
const language = require("../lang.json");

const projectModel = require("../models/project.js");
const userModel = require("../models/user.js");

exports.run = async (client, message, args) => {
    const user = await userModel.findOne({ userID: message.author.id });
    
    const langFile = await (language[user?.lang?.toLowerCase?.()] ?? language["en"]);
    const premium = await (user?.premium == true) ? true : false;

    if(message.channel.type !== "DM") return message.reply("❌ | "+langFile.onlyDm);
    if(client.guilds.cache.filter(guild => guild.ownerId == message.author.id).size < 1) return message.reply("❌ | "+langFile.guildAdd);

    const projects = await projectModel.find({ userID: message.author.id });
    
    const msg = await message.channel.send({
        embeds: [{
            author: { name: langFile.projects, icon_url: message.author.displayAvatarURL({ dynamic: true})},
            description: `
${projects.length > 0 ? `${message.author.username}${langFile.projectsBelow}` : `${message.author.username} ${langFile.noProjects}`}
${projects?.map((x, i) => `**#${i+1}** • [🔗 ${langFile.openLink}](${x.url}) • <t:${Math.floor(new Date(x.lastHost).getTime()/1000.00)}:R> • ♻️ **${x.totalHost}** • 📶 **${x.lastPing} ms** • 📥 <t:${Math.floor(new Date(x.date).getTime()/1000.00)}:R>`).join("\n") ?? ""}`,
            color: 0x0f71d4
        }],
        components: [{
            type: 1,
            components: [{
                type: 2,
                label: langFile.addProject,
                custom_id: "addProject."+message.author.id,
                style: 1,
                disabled: (!premium && projects?.length >= 5) ? true : (premium && projects?.length >= 15) ? true : false
            },
            {
                type: 2,
                label: langFile.removeProject,
                custom_id: "removeProject."+message.author.id,
                style: 2,
                disabled: (projects?.length == 0) ? true : false
            }]
        }]
    });

const filter = int => int.user.id == message.author.id;
const collector = await msg.createMessageComponentCollector({ filter, time: 60000, componentType: "BUTTON" });

collector.on("end", async(collected) => {
    if(msg.editable) return msg.edit({ components: [{ type: 1, components: [{ type: 2, style: 4, disabled: true, custom_id: "closed", label: langFile.interactionClosed }]}]});
});

collector.on("collect", async(int) => {
    await int.deferReply({ ephemeral: true });

    const vr = await int.customId.split(".")[0];
    const author = await int.customId.split(".")[1];

    if(vr === "addProject") {
        const projects = await projectModel.find({ userID: message.author.id });

        if(!premium && projects?.length >= 5) return int.editReply("❌ | "+langFile.maxProject);
        if(premium && projects?.length >= 15) return int.editReply("❌ | "+langFile.maxPreProject);

        const flt = x => x.author.id == message.author.id;
        const pCollector = await int.message.channel.createMessageCollector({flt, max: 1, time: 15000})
        
        await int.editReply({ content: "🔗 | "+langFile.sendProject, ephemeral: true});

        pCollector.on("collect", async(pmsg) => {
            if(pmsg.deletable) await pmsg.delete();

            if(!pmsg.content.startsWith("http")) return int.editReply({ content: "🔗 | "+langFile.notUrl, ephemeral: true});

            const d1 = Date.now();

            try {
                const res = fetch(pmsg.content);
            } catch(err) {
                if(err) return int.editReply({ content: "❌ | "+langFile.notUptimeProject});
            };
                    
            const d2 = Date.now();
            const ms = d2-d1;

            await projectModel.findOneAndUpdate({ userID: author, url: pmsg.content}, { $set: { date: new Date(), totalHost: 1, lastHost: new Date(), lastPing: ms } }, { upsert: true});
            return int.editReply({ content: "✅ | "+langFile.projectUptimed+" **"+ms.toFixed(2)   +" ms**", ephemeral: true});
        });
    };

    if(vr === "removeProject") {
        const projects = await projectModel.find({ userID: message.author.id });

        if(projects.length <= 0) return int.editReply("❌ | "+langFile.notHaveProject)

        const projs = [];
        await projects.forEach(x => {
            projs.push({
                "label": x.url,
                "value": "project-"+x.url,
                "description": langFile.clickDeleteProject
            });
        });

        await int.editReply({ 
                components: [{
                        type: 1,
                        components: [{
                                type: 3,
                                custom_id: "projects."+message.author.id,
                                options: projs,
                                placeholder: langFile.chooseProjectDelete,
                                min_values: 1,
                                max_values: 1
                            }]
                    }]
        });

    const rep = await int.fetchReply();

    const scollector = await rep.createMessageComponentCollector({ filter, time: 60000, componentType: "SELECT_MENU" });

    scollector.on("end", async(collected) => {
        return;
    });

    scollector.on("collect", async(interaction) => {
        const pr = await interaction.customId.split(".")[0];
        const author = await interaction.customId.split(".")[1];

        if(pr !== "projects") return;

        const vr = await interaction.values[0];
        
        if(!vr.startsWith("project")) return;

        await interaction.deferReply({ ephemeral: true});

        const url = await vr.slice(8);

        const data = await projectModel.findOne({ userID: interaction.user.id, url: url});
        if(!data) return interaction.editReply({ content: "❌ | "+langFile.removedProject, ephemeral: true})

        const selectMenu = await interaction?.message?.components?.[0]?.components?.[0]
        const options = await interaction?.message?.components?.[0]?.components?.[0]?.options;
        const values = await options.filter(option => option.value !== "project-"+url);

        await projectModel.findOneAndDelete({ userID: interaction.user.id, url: url});
        return interaction.editReply({ content: "✅ | "+langFile.projectSuccessDeleted, components: [{ type: 1, components: [{ ...selectMenu, options: values }] }], ephemeral: true });
        
    })
    }
})

};


module.exports.config = {
  name: 'projects',
  description: 'View your projects in Uptimer',
  aliases: ["myprojects", "myp", "projelerim", "pr", "projeler"]
};