module.exports = (bot, channel) => {
  const activeTrade = bot.activeTrades.filter(t => t.channel_id === channel.id)[0]
  if (activeTrade.length < 1) return;
  activeTrade.del(true)
}
