const Discord = require("discord.js");
const config = require('../config.json')
exports.run = async (client, message, args) => {
  if(!config.owners.includes(message.author.id)) return;
  if(!args[0]) return message.reply("Kod gir.");
  
    try {
        
        let codein = args.join(" ");
        let code = eval(codein);
      
      if(code === true) code = "Olumlu";
      if(code === false) code = "Olumsuz";
        
      if (typeof code !== 'string')
      code = require('util').inspect(code, { depth: 0 });
        let çıkış = (`\`\`\`js\n${code}\n\`\`\``);
 message.reply({embeds: [{
description: "**» Yapılan işlem**\n" + çıkış, 
}]})
      } catch(e) {
        message.reply({ embeds: [{ title: "» Discord hatası", color: 16711684, description: `\`\`\`js\n${e}\n\`\`\`` }] });
    };
};


module.exports.config = {
  name: 'eval',
  description: 'Bot adminlerinin bot üzerinde kod test etmesini sağlar.',
  aliases: []
};