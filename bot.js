const Discord = require('discord.js')
// const moment = require('moment')
const fs = require('fs')
const Enmap = require('enmap')

const settings = require('./configs/settings.json')
// const settings_handler = require('./settings.js')
let items = require('./configs/items.json')
// let AddingItem = require('./objects.js').AddingItem

const bot = new Discord.Client({disableEveryone: true})

require('./modules/functions.js')(bot)
bot.logger = require('./modules/logger.js')

bot.settings = settings
bot.config = settings.config

bot.items = items

fs.readdir('./events/', (err, files) => {
  if (err) return console.error(err.message);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    const event = require(`./events/${file}`)
    let eventName = file.split('.')[0]
    bot.on(eventName, event.bind(null, bot))
    delete require.cache[require.resolve(`./events/${file}`)]
  })
})

bot.cmds = new Enmap()

fs.readdir('./cmds/', (err, files) => {
  if (err) console.error(err.message);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./cmds/${file}`)
    let cmdName = file.split('.')[0]
    bot.cmds.set(cmdName, props)
  })
})

// let inUse = []

// bot.on('message', msg => {
//   if (msg.author.bot) return;
//   let args = msg.content.split(/\s+/g)
//   // eval command
//   if (msg.content.startsWith(prefix) && msg.channel.type !== "dm") {
//     let cmd = args.shift().substring(1).toLowerCase()
//     if (cmd === "eval") {
//       if(msg.author.id !== "338670732403933194") return;
//       try {
//         const code = args.join(" ");
//         let evaled = eval(code);
//         if (typeof evaled !== "string")
//           evaled = require("util").inspect(evaled);
//         msg.channel.send(clean(evaled), {code:"xl"});
//       } catch (err) {
//         msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
//       }
//     }
//     else if (cmd === "config") {
//       settings_handler.run(msg, args);
//     }
//     return;
//   }

//   // dm commands

// })

bot.login(settings.token)
