module.exports.run = async (bot, msg, args) => {
  let test = ["Option 1", "Option 2", "Option 3"]
  console.log(await bot.choose(msg.channel, msg.author, test))
}

module.exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: ["Owner"]
}

module.exports.help = {
  name: "emoji",
  category: "System",
  description: "Shows info about an emoji",
  usage: "emoji <emoji>"
}
