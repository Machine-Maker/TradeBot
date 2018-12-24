exports.run = async (bot, msg, args) => {
  async function reset(obj, value, log) {
    const reply = await bot.awaitReply(msg, `Confirm the reset by typing \`\`yes\`\` in the next 10 seconds.`, 10000)
    if (!reply)
      return bot.msg(msg.channel, "You did not reply in time!", "red")
    if (reply.toLowerCase() !== "yes")
      return bot.msg(msg.channel, "Cancelled!", "red")
    if (obj.search("Trades") > -1) {
      bot[obj].forEach(t => {
        if (obj === "publicTrades")
          t.message.delete().catch(err => {
            bot.logger.error("Unable to delete message!")
            bot.logger.error(err)
          })
        else if (obj === "storeTrades")
          t.message.delete().catch(err => {
            bot.logger.error("Unable to delete message!")
            bot.logger.error(err)
          })
      })
    }
    bot[obj] = value
    bot.updateFile(`${obj}.json`, bot[obj])
    bot.logger.warn(log)
    bot.msg(msg.channel, log, "yellow")
  }

  if (args[0]) {
    switch (args[0].toLowerCase()) {
      case "items":
        reset("items", {}, "Removing all configured items!")
        break
      case "trades":
        reset("storeTrades", [], "Removing all public trades!")
        reset("publicTrades", [], "Removing all store trades!")
        break
      case "public-trades":
        reset("publicTrades", [], "Removing all public trades!")
        break
      case "store-trades":
        reset("storeTrades", [], "Removing all store trades!")
        break
      case "active-trades":
        const reply = await bot.awaitReply(msg, `Confirm the reset by typing \`\`yes\`\` in the next 10 seconds!`, 10000)
        if (!reply || reply.toLowerCase() !== "yes")
          return bot.msg(msg.channel, "Cancelled!", "red")
        try {
          await bot.asyncForEach(bot.activeTrades, async t => {
            if (t.channel) await t.channel.delete();
            else await bot.tradeGuild.channels.get(t.channel_id).delete();
          })
        } catch (err) {
          bot.logger.error("Unable to delete channel!")
          bot.logger.error(err)
        }
        bot.activeTrades = []
        bot.ActiveTrade.save()
        bot.msg(msg.channel, "Removing all active trades!", "yellow")
        break
      case "all":
        reset("items", {}, "Removing all configured items!")
        reset("storeTrades", [], "Removing all public trades!")
        reset("publicTrades", [], "Removing all store trades!")
        break
      default:
        bot.cmds.get("help").run(bot, msg, ["reset"])
    }
  }
  else {
    bot.cmds.get("help").run(bot, msg, ["reset"])
  }
}

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: ["Admin", "Owner"]
}

exports.help = {
  name: "reset",
  category: "Administration",
  description: "Resets all/some configured items",
  usage: "reset [items|trades|public-trades|store-trades|active-trades|all]"
}
