exports.run = async (bot, msg) => {
  if (msg.channel.type !== "dm")
    return bot.msg(msg.channel, "You must dm the bot to use this command!")

  if (!bot.tradeGuild.members.get(msg.author.id))
    return bot.msg(msg.channel, "You must be in the trading discord!", "red")
  const member = bot.tradeGuild.members.get(msg.author.id)

  const options = ["Basic Schematic", "Engine", "Wing", "Cannon", "Swivel", "Clothing item (not schem)", "Dye (pigment, dye bottle, paint, etc)"]
  let choice = await bot.choose(msg.channel, msg.author, options)

  const isPublicTrade = bot.getPermLevel(member) === "All"
  let obj = null

  switch (choice) {
    case "Engine":
    case "Wing":
    case "Cannon":
    case "Swivel":
      obj = new bot.NewProceduralTrade(msg.channel.id, msg.author.id, !isPublicTrade, choice.toLowerCase())
      break
    case "Clothing item (not schem)":
      obj = new bot.NewClothingTrade(msg.channel.id, msg.author.id, !isPublicTrade)
      break
    case "Dye (pigment, dye bottle, paint, etc)":
      obj = new bot.NewColorTrade(msg.channel.id, msg.author.id, !isPublicTrade)
      break
    case "Basic Schematic":
      obj = new bot.NewBasicTrade(msg.channel.id, msg.author.id, !isPublicTrade)
      break
    default:
      bot.msg(msg.channel, "Something went wrong! Aborted", "red")
  }

  obj.start(msg)
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: ["All", "Staff", "Admin", "Owner"]
}

exports.help = {
  name: "addtrade",
  category: "DM Commands",
  description: "Add a new trade",
  usage: "addtrade"
}
