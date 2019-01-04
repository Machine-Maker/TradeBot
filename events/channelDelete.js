module.exports = (bot, channel) => {
  const activeTrade = bot.activeTrades.find(t => t.channel_id === channel.id)
  if (!activeTrade) return;
  activeTrade.del(true)
}
