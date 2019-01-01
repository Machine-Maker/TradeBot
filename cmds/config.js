exports.run = (bot, msg, args) => {
  let options = Object.keys(bot.config)
  if (args.length === 0) {
    let config_msg = ""
    for (let i = 0; i < options.length; i++) {
      config_msg += `${options[i]}: ${JSON.stringify(bot.config[options[i]], null, 2)}\n\n`
    }
    return msg.channel.send(config_msg, {code: "json"});
  }
  else if (!options.includes(args[0]))
    return msg.channel.send(`"${args[0]}" is not a config option!`, {code: "bash"});
  else if (args.length === 1) {
    return msg.channel.send(`${args[0]}: ${JSON.stringify(bot.config[args[0]], null, 2)}`, {code: "json"})
  }
  else if (args.length === 2 && bot.typeChecks[args[0]] !== 'object') {
    switch (bot.typeChecks[args[0]]) {
      case "string":
        bot.config[args[0]] = args[1]
        msg.channel.send(`${args[0]} was changed to "${args[1]}"`, {code: "bash"})
        bot.updateFile('settings.json', bot.settings)
        break;
      case "boolean":
        if (args[1].toLowerCase() !== "true" && args[1].toLowerCase() !== "false")
          return msg.channel.send(`"${args[1]}" is not a boolean!`, {code: "bash"})
        else {
          bot.config[args[0]] = JSON.parse(args[1])
          msg.channel.send(`${args[0]} was changed to "${args[1]}"`, {code: "bash"})
          bot.updateFile('settings.json', bot.settings)
        }
        break
      case "number":
        if (isNaN(args[1]))
          return msg.channel.send(`"${args[1]}" is not a number!`, {code: "bash"})
        else {
          bot.config[args[0]] = parseInt(args[1])
          msg.channel.send(`${args[0]} was changed to "${args[1]}"`, {code: "bash"})
          bot.updateFile('settings.json', bot.settings)
        }
        break;
      case "channel":
        if (!msg.mentions.channels.firstKey() && !msg.client.channels.has(args[1])) {
          return msg.channel.send(`"${args[1]}" is not a channel or channel id!`, {code: "bash"})
        }
        else {
          bot.config[args[0]] = (msg.mentions.channels.firstKey()) || msg.client.channels.get(args[1]).id
          msg.channel.send(`${args[0]} was changed to "${args[1]}"`, {code: "bash"})
          bot.updateFile('settings.json', bot.settings)
        }
        break;
      case "role":
        if (!msg.mentions.roles.firstKey()) {
          return msg.channel.send(`"${args[1]}" is not a role mention!`, {code: "bash"})
        }
        else {
          bot.config[args[0]] = msg.mentions.roles.firstKey()
          msg.channel.send(`${args[0]} was changed to "${args[1]}"`, {code: "bash"})
          bot.updateFile('settings.json', bot.settings)
        }
    }
  }
  else if (bot.typeChecks[args[0]] === 'object') {
    if (args.length === 3 && args[1].toLowerCase() === 'del') {
      if (Object.keys(bot.config[args[0]]).includes(args[2])) {
        delete bot.config[args[0]][args[2]]
        msg.channel.send(`Deleted "${args[2]}"`, {bash: "bash"})
        bot.updateFile('settings.json', bot.settings)
      }
      else {
        return msg.channel.send(`"${args[2]}" is not part of that config!`, {bash: "bash"})
      }
    }
    else if ([3, 4].includes(args.length) && args[1].toLowerCase() === 'add') {
      if (args.length === 3) { // create channel with name
        if (Object.keys(bot.config[args[0]]).includes(args[2]))
          msg.channel.send(`"${args[2]}" is already a category!`, {code: "bash"})
        else {
          bot.tradeGuild.createChannel(args[2]).then(channel => {
            bot.config[args[0]][args[2]] = channel.id
            msg.channel.send(`Added ${channel}!`)
            bot.updateFile('settings.json', bot.settings)
          }).catch(err => {
            return console.error(err)
          })

        }
      }
      else if (args.length === 4) {
        if (!isNaN(args[3])) {
          bot.config[args[0]][args[2]] = args[3]
          msg.channel.send(`Added \`\`{${args[2]}: ${args[3]}}\`\``)
          bot.updateFile('settings.json', bot.settings)
        }
        else {
          return msg.channel.send(`"${args[3]}" is not a number!`, {code: "bash"})
        }
      }
    }
    else {
      return msg.channel.send(`Use format \`\`${bot.config.prefix}settings ${args[0]} <add|del> <key> <value>\`\``)
    }
  }
}

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["settings"],
  permLevel: ["Admin", "Owner"]
}

exports.help = {
  name: "config",
  category: "System",
  description: "Show/Edit bot configurations",
  usage: "config <option> [add|del] [...values]"
}
