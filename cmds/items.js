exports.run = (bot, msg, args) => {
  if (!args[0]) {
    let sorted = {}
    Object.keys(bot.items).sort().forEach(i => {
      sorted[i] = bot.items[i]
    })
    msg.channel.send(JSON.stringify(sorted, null, 2), {code: "json"})
  }
  else {
    if (args.length >= 2 && args[0].toLowerCase() === "del") {
      args.shift()
      const name = args.join(" ")
      if (Object.keys(bot.items).includes(name)) {
        delete bot.items[name]
        bot.logger.delItem("Deleted an item", name)
        msg.channel.send(`Deleted "${name}"!`, {code: "bash"})
        bot.updateFile("items.json", bot.items)
      }
      else {
        msg.channel.send(`"${args[1]}" is not a valid item name!`, {code: "bash"})
      }
    }
    else {
      bot.cmds.get("help").run(bot, msg, ["items"])
    }
  }
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
  description: "Lists items configured with the bot. To add an item, use additem",
  usage: "items [del] [item]"
}
