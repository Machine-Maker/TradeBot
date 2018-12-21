const fs = require('fs')

let inUse = [];

module.exports = (bot, msg) => {
  if (msg.author.bot) return;
  const args = msg.content.slice(bot.config.prefix.value.length).trim().split(/\s+/g)
  const cmd_name = args.shift().toLowerCase()
  if (msg.content.startsWith(bot.config.prefix.value) && msg.channel.type !== "dm") {
    const cmd = bot.cmds.get(cmd_name)
    if (!cmd) return;
    cmd.run(bot, msg, args)
  }

  // dm commands
  let obj;
  inUse.forEach(o => {
    if (o.id === msg.channel.id) {
      obj = o
      return
    }
  })
  if (!obj && msg.content.startsWith(bot.config.prefix.value + "additem")) {
    obj = new bot.AddingItem(msg.channel.id, bot)
    inUse.push(obj)
    msg.channel.send(obj.next)
  }
  else if (obj) {
    if (msg.content.toLowerCase() === bot.config.prefix.value + "cancel") {
      inUse = inUse.filter(o => o.id !== msg.channel.id)
      msg.channel.send("Cancelled")
      return
    }
    if (obj.next.startsWith("Choose") && !Object.keys(bot.config.categories.value).includes(msg.content)) {
      msg.channel.send(obj.next)
      return
    }
    obj.next = msg.content
    let next_msg = obj.next
    msg.channel.send(next_msg)
    if (next_msg === "Finished") {
      bot.items[obj.itemObj()[0]] = obj.itemObj()[1]
      fs.writeFile('./configs/items.json', JSON.stringify(bot.items, null, 2), err => {
        if (err) return console.log(err.message);
        console.log("Updated items.json!")
      })
      inUse = inUse.filter(o => o.id !== msg.channel.id)
    }
  }
}
