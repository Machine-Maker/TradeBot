const fs = require('fs')

module.exports = (bot) => {
  bot.clean = async (bot, text) => {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof evaled !== "string")
      text = require("util").inspect(text, {depth: 1});

    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(bot.settings.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");

    return text;
  };

  bot.time = offset => {
    return require('moment')().utcOffset(offset).format('MM/D/YY HH:mm:ss')
  }

  bot.awaitReply = async (msg, question, limit = 60000, code = "") => {
    const filter = m => m.author.id === msg.author.id;
    if (code) await msg.channel.send(question, {code: code})
    else await msg.channel.send(question)
    try {
      const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"]})
      return collected.first().content
    } catch (err) {
      return false
    }
  }

  bot.updateFile = (file, data) => {
    fs.writeFile(`./configs/${file}`, JSON.stringify(data, null, 2), err => {
      if (err) return bot.logger.error(err.message);
      bot.logger.log(`Successfully updated ${file}!`)
    })
  }

  bot.msg = (channel, content, color = "none", options = {}) => {
    switch (color) {
      case "none":
        if (!options.code) options.code = "";
        return channel.send(content, options)
      case "red":
        if (!options.code) options.code = "diff";
        return channel.send(`- ${content} -`, options)
      case "orange":
        if (!options.code) options.code = "css";
        return channel.send(`[${content}]`, options)
      case "yellow":
        if (!options.code) options.code = "fix";
        return channel.send(content, options)
      case "green":
        if (!options.code) options.code = "css";
        return channel.send(content, options)
      case "blue":
        if (!options.code) options.code = "asciidoc";
        return channel.send(`= ${content} =`, options)
      case "cyan":
        if (!options.code) options.code = "yaml";
        return channel.send(content, options)
      case "highlighted":
        if (!options.code) options.code = "tex";
        return channel.send(`$ ${content} `, options)
      default: throw new TypeError(`${color} is not a valid option!`)
    }
  }
}
