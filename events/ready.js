const fs = require('fs')

const files = {
  publicTrades: require("../configs/publicTrades.json"),
  storeTrades: require("../configs/storeTrades.json"),
  activeTrades: require("../configs/activeTrades.json")
}



module.exports = async (bot) => {
  let onReady = `Logged in as ${bot.user.username}    ID: ${bot.user.id}`
  bot.logger.log(onReady)
  bot.logger.log('-'.repeat(onReady.length))

  bot.tradeGuild = bot.guilds.get(bot.settings.guildID)
  if (bot.tradeGuild)
    bot.logger.log(`Loaded trade guild`)
  else
    bot.logger.error("NO GUILD FOUND! Please configure the guild id or the bot will not work!")

  bot.tradeCategory = bot.tradeGuild.channels.find(ch => ch.name === "Active Trades" && ch.type === "category")
  if (!bot.tradeCategory)
    bot.tradeCategory = await bot.tradeGuild.createChannel("Active Trades", "category")
  bot.logger.log("Found/Created trade channel category")

  await bot.tradeGuild.fetchMembers()
  bot.logger.log(`Cached all members from trade guild`)

  const fileKeys = Object.keys(files)
  for (let i = 0; i < fileKeys.length; i++) {
    bot[fileKeys[i]] = []
    await bot.asyncForEach(files[fileKeys[i]], async t => {
      let trade = await new bot[t.tradeType](t, t.type).init()
      if (!trade) return;
      bot[fileKeys[i]].push(trade)
    })
    bot.logger.log(`Loaded ${bot[fileKeys[i]].length} ${fileKeys[i].split("T")[0]} trades`)
  }
}
