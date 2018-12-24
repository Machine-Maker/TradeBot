module.exports = (bot) => {
  class Prompt {
    constructor(_prompt, _responseType, _options = []) {
      this.prompt = _prompt
      this.responseType = _responseType
      this.value = ""
      this.options = _options
    }
  }

  class DMCommand {
    constructor(_id, _prompts) {
      this.id = _id
      this.prompts = _prompts
      bot.inUse.push(this)
    }

    async start(msg) {
      while (this.nextPrompt()) {
        const prompt = this.nextPrompt()
        const reply = await bot.awaitReply(msg, prompt.prompt, 120000, "yaml")
        if (!reply || reply.toLowerCase() === "cancel") return this.remove(msg, true);
        if (!await bot.typeCheck(reply, prompt.responseType, prompt.options))
          bot.msg(msg.channel, `${reply} is not a valid ${prompt.responseType}`, "red")
        else
          prompt.value = reply
      }
      this.complete(msg)
    }

    nextPrompt() {
      for (let i = 0; i < this.prompts.length; i++) {
        if (!this.prompts[i].value) return this.prompts[i];
      }
      return null
    }

    remove(msg, cancel = false) {
      if (cancel) bot.msg(msg.channel, "You have cancelled this process!", "red");
      bot.inUse = bot.inUse.filter(o => o.id !== msg.channel.id)
    }
  }

  bot.NewItem = class NewItem extends DMCommand {
    constructor(_channel_id) {
      let prompts = []
      prompts.push(new Prompt("Enter an item name", "string"))
      prompts.push(new Prompt("Enter an image url", "image link"))
      prompts.push(new Prompt("Enter an item description", "string"))
      prompts.push(new Prompt(`Choose an item category: ${Object.keys(bot.config.categories.value).join(", ")}`, "choice", Object.keys(bot.config.categories.value)))
      super(_channel_id, prompts)
    }

    complete(msg) {
      bot.items[this.prompts[0].value] = {
        description: this.prompts[2].value,
        image_url: this.prompts[1].value,
        category: this.prompts[3].value
      }
      bot.updateFile("items.json", bot.items)
      bot.msg(msg.channel, `Added ${this.prompts[0].value}!`, "green")
      bot.logger.log(`Added new item: ${this.prompts[0].value}`)
      this.remove(msg)
    }
  }

  class NewTrade extends DMCommand {
    constructor(_channel_id, _user_id, _isStoreTrade, _type, _prompts = []) {
      let prompts = []
      prompts.push(new Prompt("Enter the item/schematic name", "choice", Object.keys(bot.items)))
      prompts.push(new Prompt("Enter a location for the trade to take place. It can be anywhere, an island, a zone, whatever.", "string"))
      prompts.push(new Prompt("Enter a cost per item (usually an amount of fuel)", "string"))
      prompts = prompts.concat(_prompts)
      super(_channel_id, prompts)
      this.isStoreTrade = _isStoreTrade
      this.userID = _user_id
      this.type = _type
    }

    async add(msg, trade) {
      try {
        let m = await trade.channel.send(trade.embed)
        trade.message_id = m.id
        if (!(await trade.init()))
          throw new Error("Error initializing the trade!")
        bot[trade.data].push(trade)
        bot.Trade.save(trade.data)
        bot.msg(msg.channel, `Added a new trade for ${trade.item_name}`, "green")
        this.remove(msg)
        bot.logger.log(`Added a new trade for ${trade.item_name} by ${trade.creator.user.username}`)
        await m.react(bot.tradeEmojis.edit)
        await m.react(bot.tradeEmojis.accept)
      } catch (err) {
        bot.logger.error("Error adding new trade!")
        bot.logger.error(err)
        bot.msg(msg.channel, "Something went wrong!", "red")
        this.message.delete()
        this.remove(msg)
      }
    }
  }

  class NewProceduralTrade extends NewTrade {
    constructor(_channel_id, _user_id, _isStoreTrade) {
      super(_channel_id, _user_id, _isStoreTrade, "procedural")
      // TODO
    }
  }

  bot.NewBasicTrade = class NewBasicTrade extends NewTrade {
    constructor(_channel_id, _user_id, _isStoreTrade) {
      let prompts = []
      prompts.push(new Prompt("How many of this item are you trading?", "number"))
      super(_channel_id, _user_id, _isStoreTrade, "basic", prompts)
    }

    complete(msg) {
      let trade = new bot.BasicTrade({
        user_id: this.userID,
        item_name: this.prompts[0].value,
        item_cost: this.prompts[1].value,
        item_count: this.prompts[2].value,
        location: this.prompts[3].value
      }, this.isStoreTrade ? "store" : "public")
      this.add(msg, trade)
    }
  }
}
