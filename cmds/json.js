exports.run = (bot, msg, args) => {
  if (args.length === 1 && msg.author.id === bot.settings.ownerID) {
    try {
      if (typeof eval(args[0]) === "object") {
        msg.channel.send(JSON.stringify(eval(args[0]), null, 2), {code: "json", split: true})
      }
    } catch (err) {
      bot.msg(msg.channel, "Invalid JSON object! (or its too big)", "red")
    }
  }
  else {
    bot.cmds.get("help").run(bot, msg, ["json"])
  }
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: ["Owner"]
}

exports.help = {
  name: "json",
  category: "System",
  description: "Formats a JSON object",
  usage: "json <obj>"
}
