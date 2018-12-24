module.exports = async (bot, reaction, user) => {
  if (user.bot) return;
  const trade = bot.storeTrades.concat(bot.publicTrades).filter(t => t.message_id === reaction.message.id)[0]
  if (!trade) return;
  switch(reaction.emoji.name) {
    case bot.tradeEmojis.edit:
      if (!user.dmChannel) await user.createDM();
      bot.msg(user.dmChannel, "Not implemented!", "red")
      break
    case bot.tradeEmojis.accept: // start new trade
      if (bot.activeTrades.filter(t => trade.message_id === t.trade_id && user.id === t.tradee_id)[0]) { // check if player is making a duplicate trade
        if (!user.dmChannel)
          await user.createDM()
        return bot.msg(user.dmChannel, "You already have an active trade for this item!", "red")
      }
      const tradee = bot.tradeGuild.members.get(user.id)
      if (user.id === trade.creator.id) {
        if (!user.dmChannel) await user.createDM();
        bot.msg(user.dmChannel, "You cannot trade with yourself!", "red")
        return reaction.remove(user)
      }

      const activeTrade = new bot.ActiveTrade({
        trade_id: trade.message_id,
        tradee_id: tradee.id,
        trade: trade
      })
      activeTrade.start(tradee)
      break
    default:
      return
  }
}
