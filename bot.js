const Discord = require('discord.js')
const moment = require('moment')
const fs = require('fs')

const settings = require('./configs/settings.json')
let items = require('./configs/items.json')
let AddingItem = require('./objects.js').AddingItem

const bot = new Discord.Client({disableEveryone: true})

const clean = text => {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

function getTime(offset) {
    return moment().utcOffset(offset).format('MM/D/YY HH:mm:ss')
}

let inUse = []

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.username}\nID: ${bot.user.id}\n${getTime(-8)}`)
  console.log('--------------------')
})

bot.on('error', err => {
  console.log(err.message)
})

bot.on('message', msg => {
  if (msg.author.bot) return;
  let args = msg.content.split(/\s+/g)
  let cmd = args.shift().substring(1)
  // eval command
  if (msg.content.startsWith(settings.prefix + "eval")) {
    if(msg.author.id !== settings.ownerID) return;
    try {
      const code = args.join(" ");
      let evaled = eval(code);
      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);
      msg.channel.send(clean(evaled), {code:"xl"});
    } catch (err) {
      msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
    return
  }
  if (msg.channel.type !== 'dm') return;
  let obj;
  inUse.forEach(o => {
    if (o.id === msg.channel.id) {
      obj = o
      return
    }
  })

  if (!obj && msg.content.startsWith(settings.prefix + "additem")) {
    obj = new AddingItem(msg.channel.id)
    inUse.push(obj)
    msg.channel.send(obj.next)
  }
  else if (obj) {
    if (msg.content.toLowerCase() === settings.prefix + "cancel") {
      inUse = inUse.filter(o => o.id !== msg.channel.id)
      msg.channel.send("Cancelled")
      return
    }
    obj.next = msg.content
    let next_msg = obj.next
    msg.channel.send(next_msg)
    if (next_msg === "Finished") {
      items[obj.values[0]] = {
        "description": obj.values[1],
        "image_url": obj.values[2]
      }
      fs.writeFile('./configs/items.json', JSON.stringify(items, null, 2), err => {
        if (err) return console.log(err.message);
        console.log("Updated items.json!")
      })
      inUse = inUse.filter(o => o.id !== msg.channel.id)
    }
  }
})

bot.login(settings.token)
