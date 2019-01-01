const events = {
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
  MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
  MESSAGE_DELETE: 'messageDelete'
};

module.exports = async (bot, event) => {
  if (!events.hasOwnProperty(event.t)) return;

  const {d: data} = event
  const user = bot.users.get(data.user_id)

  if (typeof bot.channels.get(data.channel_id) === "undefined")
    await user.createDM();
  const channel = bot.channels.get(data.channel_id)

  switch (event.t) {
    case "MESSAGE_REACTION_ADD":
    case "MESSAGE_REACTION_REMOVE": {
      if (channel.messages.has(data.message_id)) return; // tests if message is already cached
      const message = await channel.fetchMessage(data.message_id)
      const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name
      const reaction = message.reactions.get(emojiKey)
      bot.emit(events[event.t], reaction, user)
      break
    }
    case "MESSAGE_DELETE": {
      const trade = bot.storeTrades.concat(bot.publicTrades).filter(t => t.message_id === data.id)[0]
      if (!trade) return;
      trade.del()
      break
    }
  }
}
