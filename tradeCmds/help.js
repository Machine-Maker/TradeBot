exports.run = (bot, msg, args, trade, perm, member) => {
  const cmds = bot.tradeCmds.filter(cmd => cmd.conf.permLevel.includes(perm))
  if (!args[0]) {
    const cmdNames = cmds.keyArray()
    const longest = cmdNames.reduce((long, str) => Math.max(long, str.length), 0)

    let output = `= Command List =\n[Use ${bot.config.prefix}help <commandname> for details]\n\n`
    const sorted = cmds.array().sort((p, c) => p.help.name > c.help.name ? 1 : -1)
    sorted.forEach(c => {
      output += `${bot.config.prefix}${c.help.name}${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}\n`
    })
    msg.channel.send(output, {code: "asciidoc", split: { char: "\u200b"}})
  }
  else {
    if (cmds.has(args[0])) {
      const cmd = cmds.get(args[0])
      msg.channel.send(`= ${cmd.help.name} = \n${cmd.help.description}\nusage:: ${cmd.help.usage}\n= ${cmd.help.name} =`, {code: "asciidoc"})
    }
  }
}

exports.conf = {
  enabled: true,
  permLevel: ["Trader", "Tradee"]
}

exports.help = {
  name: "help",
  description: "Shows into about the trade commands",
  usage: "help [commandname]"
}
