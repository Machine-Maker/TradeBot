const Discord = require('discord.js')
const fs = require('fs')
const Enmap = require('enmap')

const settings = require('./configs/settings.json')

const bot = new Discord.Client({disableEveryone: true})

require('./modules/functions.js')(bot)
require('./modules/dmCommands.js')(bot)
require('./modules/tradeTypes.js')(bot)
require('./modules/activeTrades.js')(bot)
require('./modules/logger.js')(bot)

bot.settings = settings
bot.config = settings.config
bot.typeChecks = settings["type-checks"]

bot.proceduralItems = require('./configs/proceduralItems.json')
bot.clothingItems = require('./configs/clothingItems.json')
bot.dyeItems = require('./configs/dyeItems.json')
bot.otherItems = require('./configs/otherItems.json')

bot.Embed = Discord.RichEmbed

require('./modules/typeChecks.js')(bot)

bot.tradeEmojis = {
  edit: "📝",
  accept: "✅",
  delete: "❌"
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
  if (err) return bot.logger.error(err);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./cmds/${file}`)
    bot.cmds.set(props.help.name, props)
    props.conf.aliases.forEach(alias => {
      bot.aliases.set(alias, props.help.name)
    })
  })
})

bot.tradeCmds = new Enmap()
fs.readdir('./tradeCmds/', (err, files) => {
  if (err) return bot.logger.error(err);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./tradeCmds/${file}`)
    bot.tradeCmds.set(props.help.name, props)
  })
})

bot.login(settings.token)
