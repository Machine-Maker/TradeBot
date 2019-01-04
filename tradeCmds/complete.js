exports.run = async (bot, msg, args, trade) => {
  if (!trade.accepted)
    return bot.msg(msg.channel, "This trade has not been accepted by the trader yet!", "red")
  // if (!["Trader", "Tradee"].includes(perm))
  //   return bot.msg(msg.channel, "You must be the trader or tradee to complete this trade!", "red")
  if (!trade.complete || typeof trade.complete === "object") {
    trade.complete = true
    await bot.msg(msg.channel, "This trade has been completed! The channel will be deleted in 10 seconds!", "green")
    trade.del()
    setTimeout((msg) => {
      msg.channel.delete().then(() => {
        bot.logger.delActive("Deleted an active trade", trade)
      }).catch(err => {
        bot.logger.error("Error deleting an active trade channel!")
        bot.logger.error(err)
      })
    }, 10000, msg)
  }
  else
    await bot.msg(msg.channel, "You have already marked this trade as complete.", "yellow")

  bot.ActiveTrade.save()

  // if (!trade.complete[perm.toLowerCase()]) {
  //   trade.complete[perm.toLowerCase()] = true
  //   if (trade.complete[perm.toLowerCase() === "trader" ?  "tradee" : "trader"]) {
  //     await bot.msg(msg.channel, "This trade has been marked complete! It will be deleted in 10 secconds!", "green")
  //     trade.del()
  //     setTimeout((msg) => {
  //       msg.channel.delete().then(() => {
  //         bot.logger.delActive("Deleted an active trade", trade)
  //       }).catch(err => {
  //         bot.logger.error("Error deleting active trade channel!")
  //         bot.logger.error(err)
  //       })
  //     }, 10000, msg)
  //   }
  //   else
  //     await bot.msg(msg.channel, "You have set this trade to complete. The other party must also mark it as complete to finish the trade!", "yellow")
  // }
  // else {
  //   bot.msg(msg.channel, "You have already marked this trade as complete.", "yellow")
  // }
  // bot.ActiveTrade.save()
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
