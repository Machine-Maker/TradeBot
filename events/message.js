module.exports = async (bot, msg) => {
  if (msg.author.bot) return;
  const args = msg.content.slice(bot.config.prefix.value.length).trim().split(/\s+/g)
  const cmd_name = args.shift().toLowerCase()
  if (msg.content.startsWith(bot.config.prefix.value) && msg.channel.type !== "dm") {
    const cmd = bot.cmds.get(cmd_name)
    if (!cmd) return;
    cmd.run(bot, msg, args)
    return
  }

  let obj = bot.inUse.find(o => o.id === msg.channel.id)
  if (!obj) {
    switch(cmd_name) {
      case "additem":
        obj = new bot.addingitem(msg.channel.id)
        break;
      case "addtrade":
        obj = new bot.addingtrade(msg.channel.id, msg.author.id, true)
        break;
      default:
        return
    }
  }
  else return;

  while (obj.nextPrompt() !== "done") {
    let prompt = obj.nextPrompt()
    let reply = await bot.awaitReply(msg, `= ${prompt.prompt} =`, 120000, "asciidoc")
    if (!reply) return obj.remove(msg, true)
    else if (reply.toLowerCase() === "cancel") return obj.remove(msg, true);
    switch (prompt.responseType) {
      case "string":
        prompt.value = reply
        break;
      case "url":
        if (!/^.*\.(jpg|JPG|gif|GIF|png|PNG|svg|SVG)$/.exec(reply))
          bot.msg(msg.channel, `{reply} is not a link to an image!`, "red")
        else {
          prompt.value = reply
        }
        break;
      case "number":
        if (isNaN(reply))
          bot.msg(msg.channel, `${reply} is not a number!`, "red")
        else {
          prompt.value = parseInt(reply)
        }
        break;
      case "choice":
        if (!prompt.options.includes(reply)) {
          bot.msg(msg.channel, `${reply} is not an option!`, "red")
        }
        else {
          prompt.value = reply
        }
    }
  }
  // let newItem = obj.getObject()
  // let embed = new bot.Embed()
  //   .setTitle(newItem[0])
  //   .setImage(newItem[1].image_url)
  //   .setDescription(newItem[1].description)
  //   .addField("Category", newItem[1].category)
  //   .setTimestamp()
  // bot.msg(msg.channel, "Type confirm within 60 seconds to add this item.", "yellow")
  // let confirm = await bot.awaitReply(msg, {embed}, 60000)
  // if (!confirm) return obj.remove(msg, true);
  obj.add(msg)
}
