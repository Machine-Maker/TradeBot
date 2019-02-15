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

  bot.choose = async (channel, user, options, prompt = null) => {
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
    let msg = null
    if (prompt)
      msg = await channel.send(prompt, {embed: embed, code: "yaml"})
    else
      msg = await channel.send(embed)
    const filter = (reaction, u) => u.id === user.id && emojis.includes(reaction.emoji.name)
    const msgFilter = m => m.author.id === user.id && (letters.includes(m.content.toLowerCase()) || m.content.toLowerCase() === "cancel")
    let responses = null
    bot.asyncForEach(emojis, async e => {
      if (!responses)
        await msg.react(e)
    })
    let aReactions = null
    let aMessages = null
    while (!responses) {
      aReactions = msg.awaitReactions(filter, {max: 1, time: 120000})
      aMessages = channel.awaitMessages(msgFilter, {max: 1, time: 120000})
      responses = await Promise.race([aReactions, aMessages])
      if (responses.size > 0 && responses.first().content && responses.first().content.toLowerCase() === "cancel") return false;
    }
    if (responses.size === 0) throw new Error("Ran out of time!");
    else if (responses.first().content) {
      return options[letters.indexOf(responses.first().content.toLowerCase())]
    }
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

  // bot.getResponse = async (msg, prompt, previous) => {
  //   let value = null
  //   if (prompt.responseType.search("embed") > -1) {
  //     let choice = null
  //     try {
  //       choice = await bot.choose(msg.channel, msg.author, prompt.options, prompt.prompt)
  //     } catch (err) {
  //       bot.msg(msg.channel, "You did not reply in time!", "red")
  //       return false;
  //     }
  //     if (!choice) throw new Error("Cancelled!");
  //     value = choice
  //   }
  //   else {
  //     const reply = bot.awaitReply(msg, prompt, 120000, "yaml", true)
  //     if (!reply) throw new Error("Cancelled!");
  //     switch(prompt.responseType) {
  //       case "string":
  //         value = reply.content
  //         break
  //       case "number":
  //         if (isNaN(reply.content)) return false;
  //         value = parseInt(reply.content)
  //         break
  //       case "image":
  //         if (bot.getResponse())
  //         break
  //       case "image link":
  //         try {
  //           let res = await axios.get(reply.content)
  //           if (res.headers["content-type"].search("image") < 0) throw new TypeError("Invalid URL");
  //           value = reply.content
  //         } catch (err) { return false; }

  //     }
  //   }
  //   return value;
  // }

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
    let perms = ["All"]
    if (member.id === bot.settings.ownerID) perms.push("Owner")
    if (member.permissions.has("ADMINISTRATOR")) perms.push("Admin")
    if (member.roles.has(bot.config["staff-role"])) perms.push("Staff")
    return perms
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
