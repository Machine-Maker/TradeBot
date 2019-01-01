module.exports = async (bot, reaction, user) => {
  if (user.bot) return;
  const trade = bot.storeTrades.concat(bot.publicTrades).filter(t => t.message_id === reaction.message.id)[0]
  if (!trade) return;
  if (!user.dmChannel)
    await user.createDM()
  switch(reaction.emoji.name) {
    case bot.tradeEmojis.edit: {
      if (bot.inUse.find(o => o.id === user.dmChannel.id)) return reaction.remove(user)
      if ((trade.type === "public" && trade.creator.id !== user.id) || trade.type === "store" && !bot.tradeGuild.roles.get(bot.config["staff-role"]).members.has(user.id)) {
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
    }
    case bot.tradeEmojis.accept: { // start new trade
      if (bot.activeTrades.find(t => trade.message_id === t.trade_id && user.id === t.tradee_id)) { // check if player is making a duplicate trade
        reaction.remove(user)
        return bot.msg(user.dmChannel, "You already have an active trade for this item!", "red")
      }
      if (user.id === trade.creator.id) {
        bot.msg(user.dmChannel, "You cannot trade with yourself!", "red")
        return reaction.remove(user)
      }
      if (!trade.changeStock(true)) {
        reaction.remove(user)
        return bot.msg(user.dmChannel, "This trade is out of stock! You cannot initiate a new trade!", "yellow")
      }
      const tradee = bot.tradeGuild.members.get(user.id)
      const activeTrade = new bot.ActiveTrade({
        trade_id: trade.message_id,
        tradee_id: tradee.id,
        trade: trade
      })
      activeTrade.start(tradee)
      reaction.remove(user)
      break
    }
    case bot.tradeEmojis.delete: {
      if ((trade.type === "public" && user.id !== trade.creator.id) || (trade.type === "store" && !bot.tradeGuild.roles.get(bot.config["staff-role"]).members.has(user.id))) {
        reaction.remove(user)
        return bot.msg(user.dmChannel, "You can only delete your own trades!", "red")
      }
      bot.msg(user.dmChannel, `You have requested to delete your trade listing for ${trade.item_name}.`, "yellow").then(m => {
        m.author = user
        bot.confirmCmd(m, 30000).then(res => {
          if (!res) return reaction.remove(user);
          reaction.message.delete()
          bot.msg(user.dmChannel, "Trade deleted!", "yellow")
        })
      })
      break
    }
    default:
      return
  }
}
