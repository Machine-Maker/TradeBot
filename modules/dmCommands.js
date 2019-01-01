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
        if (prompt.responseType === "embed choice") {
          const val = await bot.choose(msg.channel, msg.author, prompt.options)
          if (!val) return this.remove(msg, true);
          prompt.value = val
        }
        else if (prompt.responseType === "image or text") {
          const reply = await bot.awaitReply(msg, prompt.prompt, 120000, "yaml", true)
          if (!reply || reply.content.toLowerCase() === "cancel") return this.remove(msg, true);
          else if (reply.content) {
            if (await bot.typeCheck(reply.content, "image link")) this.imageOrText = "image"
            else this.imageOrText = "text"
            prompt.value = reply.content
          }
          else if (reply.attachments && reply.attachments.first()) {
            prompt.value = reply.attachments.first().url
            this.imageOrText = "image"
          }
        }
        else {
          const reply = await bot.awaitReply(msg, prompt.prompt, 120000, "yaml")
          if (!reply || reply.toLowerCase() === "cancel") return this.remove(msg, true);
          if (!await bot.typeCheck(reply, prompt.responseType, prompt.options, prompt.previous))
            bot.msg(msg.channel, `${reply} is not a valid ${prompt.responseType}`, "red")
          else
            prompt.value = reply
        }

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
    constructor(_channel_id, _type) {
      let prompts = []
      prompts.push(new Prompt("Enter an item name", "string"))
      prompts.push(new Prompt("Enter an image url", "image link"))
      prompts.push(new Prompt("Enter an item description", "string"))
      prompts.push(new Prompt(`Choose an item category: ${Object.keys(bot.config.categories).join(", ")}`, "choice", Object.keys(bot.config.categories)))
      super(_channel_id, prompts)
      this.type = _type
    }

    complete(msg) {
      const embed = new bot.Embed()
        .setTitle(this.prompts[0].value)
        .setDescription(`\`\`\`fix\n${this.prompts[2].value}\`\`\``)
        .setThumbnail(this.prompts[1].value)
        .addField("Category", this.prompts[3].value)
        .setColor("#004ac1")
      msg.channel.send(embed).then(() => {
        bot.confirmCmd(msg, 30000).then(res => {
          if (!res) return;
          bot[`${this.type}Items`][this.prompts[0].value] = {
            image_url: this.prompts[1].value,
            description: this.prompts[2].value,
            category: this.prompts[3].value
          }
          bot.updateFile(`${this.type}Items.json`, bot[`${this.type}Items`])
          bot.msg(msg.channel, `Added ${this.prompts[0].value}!`, "green")
          bot.logger.newItem("Added a new item", this.prompts[0].value)
          this.remove(msg)
        }).catch(err => bot.logger.error(err))
      }).catch(err => bot.logger.error(err))
    }
  }

  class NewTrade extends DMCommand {
    constructor(_channel_id, _user_id, _isStoreTrade, _type, _prompts = [], firstPrompt = []) {
      let prompts = firstPrompt
      prompts.push(new Prompt("Enter a location for the trade to take place. It can be anywhere, an island, a zone, whatever.", "string"))
      prompts.push(new Prompt("Enter a cost per item (except dye, then the cost is for the bunch of it)", "string"))
      prompts = prompts.concat(_prompts)
      super(_channel_id, prompts)
      this.isStoreTrade = _isStoreTrade
      this.userID = _user_id
      this.type = _type
    }

    complete(msg) {
      this.trade = {
        user_id: this.userID,
        item_cost: this.prompts[2].value,
        location: this.prompts[1].value
      }
      this.createTradeObject()
      msg.channel.send(this.tradeObj.embed).then(() => {
        bot.confirmCmd(msg, 30000).then(res => {
          if (!res) return;
          this.add(msg, this.tradeObj)
        }).catch(err => bot.logger.error(err))
      }).catch(err => bot.logger.error(err))
    }

    async add(msg, trade) {
      const m = await trade.channel.send(trade.embed)
      trade.message_id = m.id
      try {
        if (!(await trade.init()))
          throw new Error("Error initializing the trade!")
        bot[trade.data].push(trade)
        bot.Trade.save(trade.data)
        bot.msg(msg.channel, `Added a new trade for ${trade.item_name}`, "green")
        this.remove(msg)
        bot.logger.newListing("Added a new trade listing", trade)
        await m.react(bot.tradeEmojis.edit)
        await m.react(bot.tradeEmojis.accept)
        await m.react(bot.tradeEmojis.delete)
      } catch (err) {
        bot.logger.error("Error adding new trade!")
        bot.logger.error(err)
        bot.msg(msg.channel, "Something went wrong!", "red")
        m.delete()
        this.remove(msg)
      }
    }
  }

  bot.NewBasicTrade = class NewBasicTrade extends NewTrade {
    constructor(_channel_id, _user_id, _isStoreTrade) {
      const firstPrompt = [new Prompt("Enter the item/schematic name", "choice", Object.keys(bot.otherItems))]
      let prompts = []
      prompts.push(new Prompt("How many of this item do you have in stock?", "number"))
      super(_channel_id, _user_id, _isStoreTrade, "basic", prompts, firstPrompt)
    }

    createTradeObject() {
      this.trade.item_count = this.prompts[3].value
      this.trade.item_name = this.prompts[0].value
      this.tradeObj = new bot.BasicTrade(this.trade, this.isStoreTrade ? "store" : "public")
    }
  }

  const procedurals = {
    "engine": ["Resilience", "Power", "Overheat Limit", "Spin Up", "Fuel Efficiency"],
    "wing": ["Resilience", "Power", "Pivot Speed"],
    "cannon": ["Resilience", "Power", "Capacity", "Overheat Limit", "Rate Of Fire"],
    "swivel": ["Resilience", "Power", "Capacity", "Overheat Limit", "Rate Of Fire"]
  }

  bot.NewProceduralTrade = class NewProceduralTrade extends NewTrade {
    constructor(_channel_id, _user_id, _isStoreTrade, proceduralType) {
      const firstPrompt = [new Prompt("Enter the schematic name", "string")]
      let prompts = []
      procedurals[proceduralType].forEach(s => {
        prompts.push(new Prompt(`Enter a ${s} value`, "number"))
      })
      super(_channel_id, _user_id, _isStoreTrade, "procedural", prompts, firstPrompt)
      this.proceduralType = proceduralType
    }

    createTradeObject() {
      this.trade = {
        ...this.trade,
        proceduralType: this.proceduralType,
        item_count: 1,
        item_name: this.proceduralType.charAt(0).toUpperCase() + this.proceduralType.slice(1),
        procedural_name: this.prompts[0].value,
        stats: {}
      }
      procedurals[this.proceduralType].forEach((s, i) => {
        this.trade.stats[s] = this.prompts[i+3].value
      })
      this.tradeObj = new bot.ProceduralTrade(this.trade, this.isStoreTrade ? "store" : "public")
    }
  }

  const colors = ["Rust", "Pumpkin", "Marauder Red", "Slate"]

  bot.NewColorTrade = class NewColorTrade extends NewTrade {
    constructor(_channel_id, _user_id, _isStoreTrade) {
      let firstPrompt = [new Prompt("Choose a type of colored item", "embed choice", ["Pigment", "Dye", "Paint Bucket", "Paint Drum"])]
      let prompts = []
      prompts.push(new Prompt("How many of this item are you putting up for trade?", "number"))
      prompts.push(new Prompt(`What is the color?\n${colors.join(", ")}`, "choice", colors))
      super(_channel_id, _user_id, _isStoreTrade, "color", prompts, firstPrompt)
    }

    createTradeObject() {
      this.trade = {
        ...this.trade,
        item_name: this.prompts[0].value,
        item_count: 1,
        quantity: this.prompts[3].value,
        color: this.prompts[4].value
      }
      this.tradeObj = new bot.ColorTrade(this.trade, this.isStoreTrade ? "store" : "public")
    }
  }

  bot.NewClothingTrade = class NewClothingTrade extends NewTrade {
    constructor(_channel_id, _user_id, _isStoreTrade) {
      let firstPrompt = [new Prompt("What is the clothing items name? (full name please)", "choice", Object.keys(bot.clothingItems))]
      let prompts = []
      prompts.push(new Prompt("Either post an image, an image link, or describe the colors", "image or text"))
      super(_channel_id, _user_id, _isStoreTrade, "clothing", prompts, firstPrompt)
    }

    createTradeObject() {
      this.trade = {
        ...this.trade,
        item_name: this.prompts[0].value,
        item_count: 1,
        imageOrText: this.imageOrText,
        imageOrTextValue: this.prompts[3].value
      }
      this.tradeObj = new bot.ClothingTrade(this.trade, this.isStoreTrade ? "store" : "public")
    }
  }

  bot.EditTrade = class EditTrade extends DMCommand {
    constructor(_channel_id, _trade) {
      let prompts = []
      console.log(_trade.tradeType)
      let props = Object.keys(bot.objProps).filter(o => bot.objProps[o].validFor.includes(_trade.tradeType))
      prompts.push(new Prompt(`Which property would you like to change? [${props.join(", ")}]`, "choice", props))
      prompts.push(new Prompt("What is the new value for the selected property?", "previous", bot.objProps, prompts[0]))
      super(_channel_id, prompts)
      this.trade = _trade
    }

    complete(msg) {
      this.trade[bot.objProps[this.prompts[0].value].name] = this.prompts[1].value
      bot.Trade.save(this.trade.data)
      this.trade.buildEmbed()
      this.trade.message.edit({embed: this.trade.embed})
      bot.msg(msg.channel, "Successfully updated trade!", "green")
      this.remove(msg)
    }
  }

  bot.EditItem = class EditItem extends DMCommand {
    constructor(_channel_id, _name, _item, _type) {
      let prompts = []
      let props = Object.keys(bot.objProps).filter(o => bot.objProps[o].validFor.includes("Item"))
      prompts.push(new Prompt(`Which property would you like to change? [${props.join(", ")}]`, "choice", props))
      prompts.push(new Prompt("What is the new value for the selected property?", "previous", bot.objProps, prompts[0]))
      super(_channel_id, prompts)
      this.item_name = _name
      this.item = _item
      this.type = _type
    }

    // TODO: Needs updating
    complete(msg) {
      this.item[bot.objProps[this.prompts[0].value].name] = this.prompts[1].value
      bot.updateFile(`${this.type}Items.json`, bot[`${this.type}Items`])
      bot.msg(msg.channel, `Successfully updated ${this.item_name}!\n NOTE: This will not update existing trades (maybe in the future?)`, "green")
      this.remove(msg)
    }
  }
}
