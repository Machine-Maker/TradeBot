exports.run = async (bot, msg, args) => {
  if (msg.author.id !== require('../configs/settings.json').ownerID) return;
  const code = args.join(' ')
  try {
    const evaled = eval(code)
    const clean = await bot.clean(bot, evaled);
    msg.channel.send(`${clean}`, {code: "js"})
  } catch (err) {
    msg.channel.send(`\`ERROR\` \`\`\`xl\n${await bot.clean(bot, err)}\n\`\`\``)
  }
}

exports.help = {
  name: "eval",
  category: "System",
  description: "Evaluates JavaScript code",
  usage: "eval [...code]"
}
