exports.run = async (bot, msg, args) => {
  if (args.length >= 2 && ["info", "del", "edit"].includes(args[0])) {
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
    if (secondCmd === "info") {
      msg.channel.send(JSON.stringify(item, null, 2), {code: "json", split: true})
    }
    else if (secondCmd === "del") {
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
        if (msg.channel.type !== "dm")
          bot.msg(msg.channel, "Check your dms", "yellow")
      })
    }
    else {
      bot.cmds.get("help").run(bot, msg, ["items"])
    }
  }
  else if ((args.length === 2 || (args.length === 3 && ["true", "false"].includes(args[2].toLowerCase()))) && ["all", "procedural", "dye", "clothing", "other"].includes(args[1].toLowerCase()) && args[0].toLowerCase() === "list") {
    let toSend = null
    if (args[1].toLowerCase() === "all") {
      if (args[2] && args[2].toLowerCase() === "true")
        toSend = JSON.stringify({
          ...bot.proceduralItems,
          ...bot.clothingItems,
          ...bot.dyeItems,
          ...bot.otherItems
        }, null, 2)
      else {
        toSend = [
          ...Object.keys(bot.proceduralItems),
          ...Object.keys(bot.clothingItems),
          ...Object.keys(bot.dyeItems),
          ...Object.keys(bot.otherItems)
        ].join("\n")
      }
    }
    else if (args[2] && args[2].toLowerCase() === "true") {
      toSend = JSON.stringify(bot[`${args[1].toLowerCase()}Items`], null, 2)
    }
    else {
      toSend = Object.keys(bot[`${args[1].toLowerCase()}Items`]).join("\n")
    }
    if (!msg.author.dmChannel) await msg.author.createDM();
    msg.author.dmChannel.send(toSend, {code: "json", split: true})
    if (msg.channel.type !== "dm")
      bot.msg(msg.channel, "Check your dms", "yellow")
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
  usage: "items <del|edit|info> <item name>\n        items list <all|procedural|dye|clothing|other> [?showDetail(true)]"
}
