exports.run = (bot, msg, args, trade) => {
  if (!trade.accepted) {
    trade.accepted = true
    bot.msg(msg.channel, "This trade has been accepted. It will NOT be deleted automatically.", "green")
  }
  else
    bot.msg(msg.channel, "This trade has already been accepted", "yellow")
}

exports.conf = {
  enabled: true,
  permLevel: ["Trader"],
  adminOnly: false,
}

exports.help = {
  name: "accept",
  description: "Accepts the current parameters of the trade",
  usage: "accept"
}
