module.exports = (bot) => {
  bot.Prompt = class Prompt {
    constructor(_prompt, _responseType, _options = []) {
      this.prompt = _prompt
      this.responseType = _responseType
      this.value = ""
      this.options = _options
    }
  }

  // DMCommand class
  class DMCommand {
    constructor(_id, _prompts) {
      this.id = _id
      this.prompts = _prompts
    }

    nextPrompt() {
      for (let i = 0; i < this.prompts.length; i++) {
        if (!this.prompts[i].value) return this.prompts[i];
      }
      return "done"
    }

    remove(msg, cancel = false) {
      if (cancel) bot.msg(msg.channel, "You have cancelled this process!", "red");
      bot.inUse = bot.inUse.filter(o => o.id !== msg.channel.id)
      delete this
    }
  }

  // AddingTrade class
  bot.addingtrade = class AddingTrade extends DMCommand {
    constructor(_id, _userID, _isStoreTrade) {
      let prompts = []
      prompts.push(new bot.Prompt("Enter the item name", "choice", Object.keys(bot.items)))
      prompts.push(new bot.Prompt("Enter a cost per item (usually an amount of fuel)", "string"))
      prompts.push(new bot.Prompt("How many are you trading?", "number"))
      prompts.push(new bot.Prompt("Enter a location for the trade to take place. It can be anywhere, an island, a zone, whatever.", "string"))
      super(_id, prompts)
      this.file = _isStoreTrade ? "store-trades.json" : "public-trades.json"
      this.botObj = _isStoreTrade ? "storeTrades" : "publicTrades"
      this.userID = _userID
      this.isStoreTrade = _isStoreTrade
      bot.inUse.push(this)
    }

    add(msg) {
      let item = bot.items[this.prompts[0].value]
      let id = `${bot.config.categories.value[item.category]}`
      let tradeChannel = bot.channels.get(id)
      let user = tradeChannel.guild.members.get(this.userID)
      if (!user) user = {nickname: "N/A", user: {avatarUrl: null}}
      const tradeEmbed = new bot.Embed()
        .setAuthor(user.nickname ? user.nickname : user.user.username, user.user.avatarURL)
        .setTitle(this.prompts[0].value)
        .setDescription(`\`\`\`${item.description}\`\`\``)
        .setThumbnail(item.image_url)
        .addField("Cost", this.prompts[1].value, true)
        .addField("In Stock", this.prompts[2].value, true)
        .setFooter(`Location: ${this.prompts[3].value}`)
      tradeChannel.send(tradeEmbed).then(m => {

        // add the trade to the array
        bot[this.botObj].push({
          user_id: this.userID,
          item_name: this.prompts[0].value,
          item_cost: this.prompts[1].value,
          item_count: this.prompts[2].value,
          location: this.prompts[3].value,
          message_id: m.id
        })

        // update the trade json file
        bot.updateFile(this.file, bot[this.botObj])
        bot.msg(msg.channel, "Done", "green")
        this.remove(msg)
        bot.logger.log(`Added a new trade for ${this.prompts[0].value} by ${user.user.username}`)

        // add reaction
        m.react(bot.tradeEmojis.edit)
        m.react(bot.tradeEmojis.accept)
      }).catch(err => {
        bot.logger.error(err.message)
      })
    }
  }

  // AddingItem class
  bot.addingitem = class AddingItem extends DMCommand {
    constructor(_id) {
      let prompts = []
      prompts.push(new bot.Prompt("Enter an item name", "string"))
      prompts.push(new bot.Prompt("Enter an image url", "url"))
      prompts.push(new bot.Prompt("Enter an item description", "string"))
      prompts.push(new bot.Prompt(`Choose an item category: ${Object.keys(bot.config.categories.value).join(", ")}`, "choice", Object.keys(bot.config.categories.value)))
      super(_id, prompts, "items.json", "items")
      bot.inUse.push(this)
    }

    add(msg) {
      bot.items[this.prompts[0].value] = {
        description: this.prompts[2].value,
        image_url: this.prompts[1].value,
        category: this.prompts[3].value
      }
      bot.updateFile("items.json", bot.items)
      bot.msg(msg.channel, "Done", "green")
      this.remove(msg)
    }
  }
}
