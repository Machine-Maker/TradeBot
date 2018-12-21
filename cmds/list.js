exports.run = (bot, msg, args) => {
  if (!args[0] || args[0].toLowerCase() === "channels") {
    let channels = msg.guild.channels.array().filter(c => c.type !== "category")

    const longest = channels.reduce((long, channel) => Math.max(long, channel.name.length), 0)

    channels.sort((a, b) => a.parent.name > b.parent.name ? 1 : a.name > b.name && a.parent.id === b.parent.id ? 1 : -1)

    let currCat = ""
    let output = `= Channels =\n`
    channels.forEach(c => {
      if (currCat !== c.parent.id) {
        output += `\u200b\n== ${c.parent.name} ==\n`
        currCat = c.parent.id
      }
      output += `${c.name}${" ".repeat(longest - c.name.length)} :: ${c.id}\n`
    })
    msg.channel.send(output, {code: "asciidoc", split: {char: "\u200b"}})
  }
  if (!args[0] || args[0].toLowerCase() === "roles") {
    let roles = msg.guild.roles.array()

    const longest = roles.reduce((long, role) => Math.max(long, role.name.length), 0)

    roles.sort((a, b) => a.name > b.name ? 1 : -1)

    let output = `= Roles = \n`
    roles.forEach(r => {
      output += `${r.name}${" ".repeat(longest - r.name.length)} :: ${r.id}\n`
    })
    msg.channel.send(output, {code: "asciidoc", split: {char: "\u200b"}})
  }
  if (args[0] && !["roles", "channels"].includes(args[0].toLowerCase())) {
    bot.cmds.get("help").run(bot, msg, ["list"])
  }
}

exports.help = {
  name: "list",
  category: "Administration",
  description: "Lists all roles or channels and their ids",
  usage: "list <roles|channels>"
}
