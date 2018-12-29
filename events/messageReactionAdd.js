module.exports = async (bot, reaction, user) => {
  if (user.bot) return;
  const trade = bot.storeTrades.concat(bot.publicTrades).filter(t => t.message_id === reaction.message.id)[0]
  if (!trade) return;
  switch(reaction.emoji.name) {
    case bot.tradeEmojis.edit:
      if (!user.dmChannel) await user.createDM();
      if (bot.inUse.find(o => o.id === user.dmChannel.id)) return reaction.remove(user)
      if ((trade.type === "public" && !bot.publicTrades.find(t => t.creator.id === user.id)) || trade.type === "store" && !bot.tradeGuild.roles.get(bot.config["staff-role"]).members.has(user.id)) {
        reaction.remove(user)
        return bot.msg(user.dmChannel, "Only the creator(s) of this trade may edit it!", "red")
      }
      const editTrade = new bot.EditTrade(user.dmChannel.id, trade)
      bot.msg(user.dmChannel, `You are editing the trade for ${trade.item_name}`, "green").then(m => {
        m.author = user
        editTrade.start(m)
      })
      reaction.remove(user)
      break
    case bot.tradeEmojis.accept: // start new trade
      if (bot.activeTrades.find(t => trade.message_id === t.trade_id && user.id === t.tradee_id)) { // check if player is making a duplicate trade
        if (!user.dmChannel)
          await user.createDM()
        reaction.remove(user)
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
      reaction.remove(user)
      break
    default:
      return
  }
}
