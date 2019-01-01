const fs = require('fs')
const moment = require('moment')
const axios = require('axios')

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
    return moment().utcOffset(offset).format('MM/DD/YY HH:mm:ss')
  }

  bot.date = offset => {
    return moment().utcOffset(offset).format("MM/DD/YY")
  }

  bot.choose = async (channel, user, options) => {
    let emojis = []
    let letters = []
    let choices = ""
    options.forEach((o, i) => {
      choices += `:regional_indicator_${String.fromCharCode(97+i)}: ${o}\n`
      emojis.push(`${String.fromCharCode(55356)}${String.fromCharCode(56806 + i)}`)
      letters.push(String.fromCharCode(97+i))
    })
    const embed = new bot.Embed()
      .setTitle("React with or type your corresponding choice")
      .setDescription(choices)
    const m = await channel.send(embed)
    const filter = (reaction, u) => u.id === user.id && emojis.includes(reaction.emoji.name)
    const msgFilter = m => m.author.id === user.id && (letters.includes(m.content.toLowerCase()) || m.content.toLowerCase() === "cancel")
    bot.asyncForEach(emojis, async e => {
      await m.react(e)
    })
    let responses = null
    while (!responses) {
      responses = await Promise.race([m.awaitReactions(filter, {max: 1, time: 120000}), channel.awaitMessages(msgFilter, {max: 1, time: 120000})])
      if (responses.size > 0 && responses.first().content && responses.first().content.toLowerCase() === "cancel") return false;
    }
    if (responses.size === 0) return false;
    else if (responses.first().content) return options[letters.indexOf(responses.first().content.toLowerCase())];
    else return options[emojis.indexOf(responses.first().emoji.name)];
  }

  bot.awaitReply = async (msg, question, limit = 60000, code = "", msgObject = false) => {
    const filter = m => m.author.id === msg.author.id;
    if (code) await msg.channel.send(question, {code: code})
    else await msg.channel.send(question)
    try {
      const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"]})
      return msgObject ? collected.first() : collected.first().content
    } catch (err) {
      console.log(err)
      return false
    }
  }

  bot.confirmCmd = async (msg, limit = 10000) => {
    const reply = await bot.awaitReply(msg, `Confirm this request by typing \`\`confirm\`\` with in the next ${limit/1000} seconds!`, limit)
    if (!reply || reply.toLowerCase() !== "confirm") {
      await bot.msg(msg.channel, "You did not confirm this request. Aborted!", "red")
      return false
    }
    return true
  }

  bot.asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

  bot.updateFile = (file, data) => {
    fs.writeFile(`./configs/${file}`, JSON.stringify(data, null, 2), err => {
      if (err) return bot.logger.error(err);
      bot.logger.fileChange(file)
    })
  }

  bot.typeCheck = async (value, type, options = [], previous = "") => {
    switch (type) {
      case "string":
        return true
      case "number":
        if (isNaN(value)) return false;
        return true
      case "image":

        break
      case "image link":
        try {
          let res = await axios.get(value)
          if (res.headers["content-type"].search("image") < 0) throw new TypeError("Invalid URL")
          return true
        } catch (err) {
          return false
        }
      case "choice":
        if (!options.includes(value)) return false;
        return true
      case "previous":
        if (!await bot.typeCheck(value, options[previous.value].type, options[previous.value].options)) return false;
        return true
      default:
        bot.logger.error(`${type} is not a valid option!`)
        return false
    }
  }

  bot.getPermLevel = member => {
    if (!bot.tradeGuild.members.has(member.id))
      return bot.logger.error("Invalid member (permission check)!")
    if (member.id === bot.settings.ownerID)
      return "Owner"
    if (member.permissions.has("ADMINISTRATOR"))
      return "Admin"
    else if (member.roles.has(bot.config["staff-role"]))
      return "Staff"
    else return "All";
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
