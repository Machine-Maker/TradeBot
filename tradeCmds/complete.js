exports.run = async (bot, msg, args, trade) => {
  if (!trade.accepted)
    return bot.msg(msg.channel, "This trade has not been accepted by the trader yet!", "red")
  if (!trade.complete || typeof trade.complete === "object") {
    trade.complete = true
    await bot.msg(msg.channel, "This trade has been completed! The channel will be deleted in 10 seconds!", "green")
    trade.del()
    setTimeout((msg) => {
      msg.channel.delete().catch(err => {
        bot.logger.error("Error deleting an active trade channel!")
        bot.logger.error(err)
      })
    }, 10000, msg)
  }
  else
    await bot.msg(msg.channel, "You have already marked this trade as complete.", "yellow")
}

exports.conf = {
  enabled: true,
  permLevel: ["Trader"],
  adminOnly: false
}

exports.help = {
  name: "complete",
  description: "Both parties must run this command for this trade to be marked complete",
  usage: "complete"
}
