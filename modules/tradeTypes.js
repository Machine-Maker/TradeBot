const fs = require('fs')

module.exports = (bot) => {

  // base trade class
  bot.Trade = class Trade {
    constructor(_obj, _type) {
      Object.assign(this, _obj)
      this.item = bot.items[this.item_name]
      this.creator = bot.tradeGuild.members.get(this.user_id)
      if (_type === "store") {
        this.channel = bot.tradeGuild.channels.get(bot.config.categories.value[this.item.category])
        this.data = "storeTrades"
      }
      else {
        this.channel = bot.tradeGuild.channels.get(bot.config["public-trade-channel"].value)
        this.data = "publicTrades"
      }
      this.type = _type
      this.embed = new bot.Embed()
        .setAuthor(this.creator.nickname || this.creator.user.username, this.creator.user.avatarURL)
        .setTitle(this.item_name)
        .setURL(`https://worldsadrift.gamepedia.com/index.php?search=${this.item_name.replace(/\s/g, "_")}`)
        .setDescription(`\`\`\`fix\n${this.item.description}\`\`\``)
        .setFooter(`Location: ${this.location}`)
        .addField("Cost", this.item_cost, true)
    }

    async init() {
      try {
        this.message = await this.channel.fetchMessage(this.message_id)
        return this
      } catch (err) {
        bot.logger.error(`${this.message.id}: Error finding message. Assuming it was deleted.`)
        return false
      }
    }

    edit(value, newValue) {
      if (!this[value]) return bot.logger.warn(`${value} is not valid!`);
      console.log(edit)
    }

    del() {
      bot[this.data] = bot[this.data].filter(t => t.message_id !== this.message_id)
      bot.Trade.save(this.data)
      bot.logger.warn(`Deleted a trade posted by ${this.creator.nickname || this.creator.user.username}!`)
    }

    static save(type) {
      let data = []
      bot[type].forEach(t => {
        data.push(t.obj())
      })
      fs.writeFile(`./configs/${type}.json`, JSON.stringify(data, null, 2), err => {
        if (err) return bot.logger.error(err);
        bot.logger.log(`Updated ${type}.json!`)
      })
    }
  }

  // basic trade class
  bot.BasicTrade = class BasicTrade extends bot.Trade {
    constructor(_obj, _type) {
      super(_obj, _type)
      this.embed.setColor("#33cc33")
        .setThumbnail(this.item.image_url)
        .addField("In stock", this.item_count, true)
    }

    obj() {
      return {
        user_id: this.creator.id,
        item_name: this.item_name,
        item_cost: this.item_cost,
        item_count: this.item_count,
        location: this.location,
        message_id: this.message_id,
        tradeType: this.constructor.name,
        type: this.type,
      }
    }
  }

  // trade class for procedurals
  bot.ProceduralTrade = class ProceduralTrade extends bot.Trade {
    constructor(_obj, _type) {
      super(_obj, _type)
      this.embed.setColor("#ff3300")
      // TODO
    }

    obj() {
      return
    }
  }

  // trade class for clothing
  bot.ClothingTrade = class ClothingTrade extends bot.Trade {
    constructor(_obj, _type) {
      super(_obj, _type)
      this.embed.setColor()
        .setImage(item.image_url)

      // TODO
    }
  }
}
