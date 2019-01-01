module.exports.run = async (bot, msg) => {
  if (msg.channel.type !== "dm")
    return bot.msg(msg.channel, "You must dm the bot to use this command!")

  if (!bot.tradeGuild.members.get(msg.author.id))
    return bot.msg(msg.channel, "You must be in the trading discord!", "red")


  const type = await bot.choose(msg.channel, msg.author, ["Clothing", "Procedural", "Dye", "Other"])

  if (!type) return bot.msg(msg.channel, "Something went wrong! Aborted", "red");

  const obj = new bot.NewItem(msg.channel.id, type.toLowerCase())

  obj.start(msg)
}

module.exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["newitem"],
  permLevel: ["Staff", "Admin", "Owner"]
}

module.exports.help = {
  name: "additem",
  category: "DM Commands",
  description: "Configures a new item",
  usage: "additem"
}
