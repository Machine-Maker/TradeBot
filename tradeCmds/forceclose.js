exports.run = async (bot, msg, args, trade) => {
  if (!await bot.confirmCmd(msg)) return;
  trade.del(true)
  if (!trade.tradee.user.dmChannel) await trade.tradee.user.createDM();
  bot.msg(trade.tradee.user.dmChannel, `Your trade for ${trade.trade.item_name} was canceled!`, "red")
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
  permLevel: ["Admin"],
  adminOnly: true
}

exports.help = {
  name: "forceclose",
  description: "Force closes the trade",
  usage: "forceclose"
}
