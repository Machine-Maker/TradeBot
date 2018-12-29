const moment = require('moment')

module.exports = (bot) => {
  class Prompt {
    constructor(_prompt, _responseType, _options = [], _previous = "") {
      this.prompt = _prompt
      this.responseType = _responseType
      this.value = ""
      this.options = _options
      this.previous = _previous
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
        if (!await bot.typeCheck(reply, prompt.responseType, prompt.options, prompt.previous))
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
      prompts.push(new Prompt(`Choose an item category: ${Object.keys(bot.config.categories).join(", ")}`, "choice", Object.keys(bot.config.categories)))
      super(_channel_id, prompts)
    }

    complete(msg) {
      const embed = new bot.Embed()
        .setTitle(this.prompts[0].value)
        .setDescription(`\`\`\`fix\n${this.prompts[2].value}\`\`\``)
        .setThumbnail(this.prompts[1].value)
        .addField("Category", this.prompts[3].value)
        .setColor("#004ac1")
      msg.channel.send(embed).then(m => {
        bot.confirmCmd(msg, 30000).then(res => {
          if (!res) return;
          bot.items[this.prompts[0].value] = {
            image_url: this.prompts[1].value,
            description: this.prompts[2].value,
            category: this.prompts[3].value
          }
          bot.updateFile("items.json", bot.items)
          bot.msg(msg.channel, `Added ${this.prompts[0].value}!`, "green")
          bot.logger.newItem("Added a new item", this.prompts[0].value)
          this.remove(msg)
        }).catch(err => bot.logger.error(err))
      }).catch(err => bot.logger.error(err))
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
        bot.logger.newListing("Added a new trade listing", trade)
        await m.react(bot.tradeEmojis.edit)
        await m.react(bot.tradeEmojis.accept)
      } catch (err) {
        bot.logger.error("Error adding new trade!")
        bot.logger.error(err)
        bot.msg(msg.channel, "Something went wrong!", "red")
        m.delete()
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
        item_cost: this.prompts[2].value,
        item_count: this.prompts[3].value,
        location: this.prompts[1].value
      }, this.isStoreTrade ? "store" : "public")
      msg.channel.send(trade.embed).then(m => {
        bot.confirmCmd(msg, 30000).then(res => {
          if (!res) return;
          this.add(msg, trade)
        }).catch(err => bot.logger.error(err))
      }).catch(err => bot.logger.error(err))
    }
  }

  const properties = {
    "Cost": "item_cost",
    "Count": "item_count",
    "Location": "location"
  }

  bot.EditTrade = class EditTrade extends DMCommand {
    constructor(_channel_id, _trade) {
      let prompts = []
      let props = ["Cost", "Count", "Location"]
      prompts.push(new Prompt(`Which property would you like to change? [${props.join(", ")}]`, "choice", props))
      const types = {"Cost": "string", "Count": "number", "Location": "string"}
      prompts.push(new Prompt("What is the new value for the selected property?", "previous", types, prompts[0]))
      super(_channel_id, prompts)
      this.trade = _trade
    }

    complete(msg) {
      this.trade[properties[this.prompts[0].value]] = this.prompts[1].value
      this.trade.buildEmbed()
      this.trade.message.edit({embed: this.trade.embed})
      bot.msg(msg.channel, "Successfully updated trade!", "green")
      this.remove(msg)
    }
  }
}
