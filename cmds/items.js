exports.run = (bot, msg, args) => {
  let sorted = {}
  Object.keys(bot.items).sort().forEach(i => {
    sorted[i] = bot.items[i]
  })
  msg.channel.send(JSON.stringify(sorted, null, 2), {code: "json"})
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: ["Staff", "Admin", "Owner"]
}

exports.help = {
  name: "items",
  category: "Administration",
  description: "Lists items configured with the bot",
  usage: "items [list]"
}
