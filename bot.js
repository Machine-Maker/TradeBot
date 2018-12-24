const Discord = require('discord.js')
const fs = require('fs')
const Enmap = require('enmap')

const settings = require('./configs/settings.json')

let items = require('./configs/items.json')

const bot = new Discord.Client({disableEveryone: true})

require('./modules/functions.js')(bot)
require('./modules/dmCommands.js')(bot)
require('./modules/tradeTypes.js')(bot)
require('./modules/activeTrades.js')(bot)
bot.logger = require('./modules/logger.js')

bot.settings = settings
bot.config = settings.config

bot.items = items

bot.Embed = Discord.RichEmbed

bot.tradeEmojis = {
  edit: "📝",
  accept: "✅"
}

// ongoing dm commands
bot.inUse = []

fs.readdir('./events/', (err, files) => {
  if (err) return bot.logger.error(err);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    const event = require(`./events/${file}`)
    let eventName = file.split('.')[0]
    bot.on(eventName, event.bind(null, bot))
    delete require.cache[require.resolve(`./events/${file}`)]
  })
})

bot.cmds = new Enmap()
bot.aliases = new Enmap()

fs.readdir('./cmds/', (err, files) => {
  if (err) bot.logger.error(err);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./cmds/${file}`)
    bot.cmds.set(props.help.name, props)
    props.conf.aliases.forEach(alias => {
      bot.aliases.set(alias, props.help.name)
    })
    return false
  })
})

bot.login(settings.token)
