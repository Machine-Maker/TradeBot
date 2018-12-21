exports.run = (bot, msg, args) => {
  if (!args[0]) {
    const cmdNames = bot.cmds.keyArray()
    const longest = cmdNames.reduce((long, str) => Math.max(long, str.length), 0)

    let curCat = ""
    let output = `= Command List =\n\n[Use ${bot.config.prefix.value}help <commandname> for details]\n`
    const sorted = bot.cmds.array().sort((p, c) => p.help.category > c.help.category ? 1 : p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1 )
    sorted.forEach( c => {
      const cat = c.help.category// .toProperCase()
      if (curCat !== cat) {
        output += `\u200b\n== ${cat} ==\n`
        curCat = cat
      }
      output += `${bot.config.prefix.value}${c.help.name}${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}\n`
    })
    msg.channel.send(output, {code: "asciidoc", split: { char: "\u200b"}})
  }
  else {
    let cmd = args[0]
    if (bot.cmds.has(cmd)) {
      cmd = bot.cmds.get(cmd)
      msg.channel.send(`= ${cmd.help.name} = \n${cmd.help.description}\nusage:: ${cmd.help.usage}\n= ${cmd.help.name} =`, {code: "asciidoc"})
    }
  }
}

exports.help = {
  name: "help",
  category: "System",
  description: "Shows info about commands",
  usage: "help [commandname]"
}
