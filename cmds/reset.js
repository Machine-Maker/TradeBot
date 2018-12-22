

exports.run = (bot, msg, args) => {
  async function reset(file, obj, value, log) {
    const reply = await bot.awaitReply(msg, `Confirm the reset by typing \`\`yes\`\` in the next 10 seconds.`, 10000)
    if (!reply)
      return bot.msg(msg.channel, "You did not reply in time!", "red")
    if (reply.toLowerCase() !== "yes")
      return bot.msg(msg.channel, "Cancelled!", "red")
    bot[obj] = value
    bot.updateFile(file, bot[obj])
    bot.logger.warn(log)
    bot.msg(msg.channel, log, "yellow")
  }

  if (args[0]) {
    switch (args[0].toLowerCase()) {
      case "items":
        reset("items.json", "items", {}, "Removing all configured items!")
        break
      case "trades":
        reset("store-trades.json", "storeTrades", [], "Removing all public trades!")
        reset("public-trades.json", "publicTrades", [], "Removing all store trades!")
        break
      case "public-trades":
        reset("public-trades.json", "publicTrades", [], "Removing all public trades!")
        break
      case "store-trades":
        reset("store-trades.json", "storeTrades", [], "Removing all store trades!")
        break
      case "all":
        reset("items.json", "items", {}, "Removing all configured items!")
        reset("store-trades.json", "storeTrades", [], "Removing all public trades!")
        reset("public-trades.json", "publicTrades", [], "Removing all store trades!")
        break
    }
  }
  else {
    bot.cmds.get("help").run(bot, msg, ["reset"])
  }
}

exports.help = {
  name: "reset",
  category: "Administration",
  description: "Resets all/some configured items",
  usage: "reset [items|trades|public-trades|store-trades|all]"
}
