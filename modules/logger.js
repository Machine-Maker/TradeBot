const moment = require('moment')
const chalk = require('chalk')

module.exports = (bot) => {
  bot.logger = {}
  bot.logger.log = (content, data, type) => {
    const timestamp = `[${moment().utcOffset(-8).format('MM/DD/YY HH:mm:ss')}]:`
    const logChannel = bot.channels.get(bot.config['logging-channel'])
    if (!logChannel)
      return console.error("Set up a log channel to enable logging!")
    const logEmbed = new bot.Embed()
      .setDescription(`\`\`\`${content}\`\`\``)
    switch (type) {
      case "new listing":
        logEmbed.addField("Item", data.item_name, true)
          .addField("Trader", data.creator.nickname || data.creator.user.username, true)
          .setColor("#00c63e")
        console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`)
        break
      case "new active":
        logEmbed.addField("New Active Trade", data.trade.item_name, true)
          .addField("Initiated by", data.tradee.nickname || data.tradee.user.username, true)
          .setColor("#00c63e")
        console.log(`${timestamp} ${chalk.bgGreen(type.toUpperCase())} ${content}`)
        break
      case "new item":
        logEmbed.addField("New Item", data)
          .setColor("#0034c6")
        console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content}`)
        break
      case "delete item":
        logEmbed.addField("Deleted Item", data)
          .setColor("#bc0000")
        console.log(`${timestamp} ${chalk.yellow.bgBlack(type.toUpperCase())} ${content}`)
        break
      case "config change":
        logEmbed.addField("Configuration Option", data[0], true)
          .addField("New Value", data[1], true)
          .setColor("#ffffff")
        console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`)
        break
      case "delete listing":
        logEmbed.addField("Item", data.item_name, true)
          .addField("Trader", data.creator.nickname || data.creator.user.username, true)
          .setColor("#bc0000")
        console.log(`${timestamp} ${chalk.yellow.bgBlack(type.toUpperCase())} ${content}`)
        break
      case "delete active":
        logEmbed.addField("Item", data.trade.item_name, true)
          .addField("Trader", data.trade.creator.nickname || data.trade.creator.user.username, true)
          .addField("Tradee", data.tradee.nickname || data.tradee.user.username, true)
          .setColor("#bc0000")
        console.log(`${timestamp} ${chalk.yellow.bgBlack(type.toUpperCase())} ${content}`)
        break
      case "warn":
        logEmbed.setColor("#f4a300")
        console.log(`${timestamp} ${chalk.yellow(type.toUpperCase())} ${content}`)
        break
      default:
        return console.log(`${timestamp} ${chalk.blue("LOG")} ${content}`)
    }
    logEmbed.setTimestamp()
    logChannel.send(logEmbed)
  }

  bot.logger.newListing = (...args) => bot.logger.log(...args, "new listing");

  bot.logger.newActive = (...args) => bot.logger.log(...args, "new active");

  bot.logger.delListing = (...args) => bot.logger.log(...args, "delete listing");

  bot.logger.delActive = (...args) => bot.logger.log(...args, "delete active");

  bot.logger.newItem = (...args) => bot.logger.log(...args, "new item");

  bot.logger.delItem = (...args) => bot.logger.log(...args, "delete item");

  bot.logger.configChange = (...args) => bot.logger.log(...args, "config change");

  bot.logger.warn = (content) => bot.logger.log(content, null, "warn")

  bot.logger.fileChange = (fileName) => {
    const timestamp = `[${moment().utcOffset(-8).format('MM/DD/YY HH:mm:ss')}]:`
    console.log(`${timestamp} ${chalk.black.bgYellow("FILE")} ${fileName} has been updated!`)
  }

  bot.logger.error = (content) => {
    const timestamp = `[${moment().utcOffset(-8).format('MM/DD/YY HH:mm:ss')}]:`
    console.log(`${timestamp} ${chalk.bgRed("ERROR")} ${content}`)
  }
}
