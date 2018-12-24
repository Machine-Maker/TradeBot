const axios = require('axios')

exports.run = async (bot, msg, args) => {
  if (msg.channel.type !== "dm")
    return bot.msg(msg.channel, "You must dm the bot to use this command!")

  if (!bot.tradeGuild.members.get(msg.author.id))
    return bot.msg(msg.channel, "You must be in the trading discord!", "red")
  const member = bot.tradeGuild.members.get(msg.author.id)

  let obj = bot.inUse.find(o => o.id === msg.channel.id)
  if (bot.getPermLevel(member) === "All")
    obj = new bot.NewBasicTrade(msg.channel.id, msg.author.id, false)
  else
    obj = new bot.NewBasicTrade(msg.channel.id, msg.author.id, true)

  obj.start(msg)
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: ["All", "Staff", "Admin", "Owner"]
}

exports.help = {
  name: "addtrade",
  category: "DM Commands",
  description: "Add a new trade",
  usage: "addtrade"
}
