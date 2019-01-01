exports.run = async (bot, msg, args) => {
  if (!args[0]) { // TODO: Update
    let sorted = {}
    Object.keys(bot.items).sort().forEach(i => {
      sorted[i] = bot.items[i]
    })
    msg.channel.send(JSON.stringify(sorted, null, 2), {code: "json", split: true})
  }
  else if (args.length >= 2) {
    const secondCmd = args.shift().toLowerCase()
    const name = args.join(" ")
    let type = null
    if (bot.otherItems[name]) type = "other";
    else if (bot.proceduralItems[name]) type = "procedural";
    else if (bot.clothingItems[name]) type = "clothing";
    else if (bot.dyeItems[name]) type = "dye";
    if (!type)
      return msg.channel.send(`"${name}" is not a valid item name!`, {code: "bash"})
    const item = bot.otherItems[name] || bot.proceduralItems[name] || bot.clothingItems[name] || bot.dyeItems[name]
    if (secondCmd === "del") {
      delete bot[`${type}Items`][name]
      bot.logger.delItem("Deleted an item", name)
      msg.channel.send(`Deleted "${name}"!`, {code: "bash"})
      bot.updateFile(`${type}Items.json`, bot[`${type}Items`])
    }
    else if (secondCmd === "edit") {
      if (!msg.author.dmChannel)
        await msg.author.createDM()
      const editItem = new bot.EditItem(msg.author.dmChannel.id, name, item, type)
      bot.msg(msg.author.dmChannel, `You are editing the item: ${name}`, "green").then(m => {
        m.author = msg.author // replace author object for awaitMessages filter (kinda a hack)
        editItem.start(m)
        bot.msg(msg.channel, "Check your dms", "yellow")
      })
    }
    else {
      bot.cmds.get("help").run(bot, msg, ["items"])
    }
  }
  else {
    bot.cmds.get("help").run(bot, msg, ["items"])
  }
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: ["Admin", "Owner"]
}

exports.help = {
  name: "items",
  category: "Administration",
  description: "Lists items configured with the bot. To add an item, use additem",
  usage: "items [del|edit] [item]"
}
