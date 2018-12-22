module.exports = (bot) => {
  let onReady = `Logged in as ${bot.user.username}    ID: ${bot.user.id}`
  bot.logger.log(onReady)
  bot.logger.log('-'.repeat(onReady.length))
}
