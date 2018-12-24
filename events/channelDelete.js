module.exports = (bot, channel) => {
  const trade = bot.activeTrades.filter(t => t.channel_id === channel.id)[0]
  if (!trade) return;
  trade.del()
}
