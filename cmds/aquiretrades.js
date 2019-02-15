exports.run = (bot, msg, args) => {
  const channel = msg.channel
  channel.fetchMessages({limit: 100}).then(messages => {
    messages.forEach(m => {
      if (m.embeds.length > 0) {
        console.log(m.embeds[0])
      }
    })
  }).catch(error => {
    console.error(error)
  })
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: ["Owner"]
}

exports.help = {
  name: "aquiretrades",
  category: "DM Commands",
  description: "Add a new trade",
  usage: "aquiretrades"
}
