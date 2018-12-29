exports.run = async (bot, msg, args, trade, perm) => {
  if (!await bot.confirmCmd(msg)) return;
  trade.del()
  if (perm === "Trader") {
    if (!trade.tradee.user.dmChannel)
      await trade.tradee.user.createDM()
    await bot.msg(trade.tradee.user.dmChannel, `Your trade for ${trade.trade.item_name} was canceled!`, "red")
  }
  bot.msg(msg.channel, "This trade has been deleted! The channel will be deleted in 10 seconds!", "yellow")
  setTimeout((msg) => {
    msg.channel.delete().then(() => {
      bot.logger.delActive("Deleted an active trade", trade)
    }).catch(err => {
      bot.logger.error("Error deleting active trade channel!")
      bot.logger.error(err)
    })
  }, 10000, msg)
}

exports.conf = {
  enabled: true,
  permLevel: ["Trader", "Tradee"]
}

exports.help = {
  name: "cancel",
  description: "Cancels the trade",
  usage: "cancel"
}
