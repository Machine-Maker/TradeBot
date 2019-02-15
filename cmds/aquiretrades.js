exports.run = (bot, msg, args) => {
  const channel = msg.channel
  channel.fetchMessages({limit: 100}).then(messages => {
    console.log(`Recieved ${messages.size} messages`)
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
