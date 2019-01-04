module.exports = (bot, channel) => {
  const activeTrade = bot.activeTrades.find(t => t.channel_id === channel.id)
  console.log(activeTrade)
  if (!activeTrade) return;
  console.log("test")
  activeTrade.del(true)
}
