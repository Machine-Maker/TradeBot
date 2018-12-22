module.exports = async (bot, reaction, user) => {
  if (user.bot) return;
  if (!bot.storeTrades.filter(t => t.message_id === reaction.message.id)) return;
  switch(reaction.emoji.name) {
    case bot.tradeEmojis.edit:
      if (!user.dmChannel) await user.createDM();
      bot.msg(user.dmChannel, "Not implemented!", "red")
      break
    case bot.tradeEmojis.accept:
      console.log("accept")
      break
    default:
      return
  }
}
