const fs = require('fs')

exports.run = (bot, msg, args) => {
  let options = Object.keys(bot.config)
  let changed = false;
  if (args.length === 0) {
    let config_msg = ""
    for (let i = 0; i < options.length; i++) {
      config_msg += `${options[i]}: ${JSON.stringify(bot.config[options[i]], null, 2)}\n\n`
    }
    msg.channel.send(config_msg, {code: "json"})
  }
  else if (!options.includes(args[0]))
    msg.channel.send(`\`\`${args[0]}\`\` is not a config option!`);
  else if (args.length === 1) {
    msg.channel.send(`${args[0]}: ${JSON.stringify(bot.config[args[0]].value, null, 2)}`, {code: "json"})
  }
  else if (args.length === 2 && bot.config[args[0]].type !== 'object') {
    switch (bot.config[args[0]].type) {
      case "string":
        bot.config[args[0]].value = args[1]
        changed = true
        msg.channel.send(`${args[0]} was changed to \`\`${args[1]}\`\``)
        break;
      case "number":
        if (isNaN(args[1]))
          msg.channel.send(`\`\`${args[1]}\`\` is not a number!`)
        else {
          bot.config[args[0]].value = parseInt(args[1])
          changed = true
          msg.channel.send(`${args[0]} was changed to \`\`${args[1]}\`\``)
        }
        break;
      case "channel":
        if (!msg.mentions.channels.firstKey() && !msg.client.channels.has(args[1])) {
          msg.channel.send(`\`\`${args[1]}\`\` is not a channel or channel id!`)
        }
        else {
          bot.config[args[0]].value = (msg.mentions.channels.firstKey()) ? msg.mentions.channels.firstKey() : msg.client.channels.get(args[1]).id
          changed = true
          msg.channel.send(`${args[0]} was changed to \`\`${args[1]}\`\``)
        }
        break;
      case "role":
        if (!msg.mentions.roles.firstKey()) {
          msg.channel.send(`\`\`${args[1]}\`\` is not a role mention!`)
        }
        else {
          bot.config[args[0]].value = msg.mentions.roles.firstKey()
          changed = true
          msg.channel.send(`${args[0]} was changed to\`\`${args[1]}\`\``)
        }
    }
  }
  else if (bot.config[args[0]].type === 'object') {
    if (args.length === 3 && args[1].toLowerCase() === 'del') {
      if (Object.keys(bot.config[args[0]].value).includes(args[2])) {
        delete bot.config[args[0]].value[args[2]]
        changed = true
        msg.channel.send(`Deleted \`\`${args[2]}\`\``)
      }
      else {
        msg.channel.send(`\`\`${args[2]}\`\` is not part of that config!`)
      }
    }
    else if (args.length === 4 && args[1].toLowerCase() === 'add') {
      if (!isNaN(args[3])) {
        bot.config[args[0]].value[args[2]] = parseInt(args[3])
        changed = true
        msg.channel.send(`Added \`\`{${args[2]}: ${args[3]}}\`\``)
      }
      else {
        msg.channel.send(`${args[3]} is not a number!`)
      }
    }
    else {
      msg.channel.send(`Use format \`\`${bot.config.prefix.value}settings ${args[0]} <add|del> <key> <value>\`\``)
    }
  }
  if (changed) {
    fs.writeFile('./configs/settings.json', JSON.stringify(bot.settings, null, 2), err => {
      if (err) return console.log(err.message);
      console.log("Updated settings.json!")
    })
  }
}

exports.help = {
  name: "config",
  category: "System",
  description: "Show/Edit bot configurations",
  usage: "config <option> [add|del] [...values]"
}
