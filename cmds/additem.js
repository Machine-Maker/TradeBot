const axios = require('axios')

exports.run = async (bot, msg, args) => {
  if (msg.channel.type !== "dm")
    return bot.msg(msg.channel, "You must dm the bot to use this command!")

  if (!bot.tradeGuild.members.get(msg.author.id))
    return bot.msg(msg.channel, "You must be in the trading discord!", "red")

  let obj = bot.inUse.find(o => o.id === msg.channel.id)
  if (!obj) {
    obj = new bot.NewItem(msg.channel.id)
  }

  obj.start(msg)
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["newitem"],
  permLevel: ["Staff", "Admin", "Owner"]
}

exports.help = {
  name: "additem",
  category: "DM Commands",
  description: "Configures a new item",
  usage: "additem"
}
