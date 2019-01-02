const fs = require('fs')
const moment = require('moment')

module.exports = (bot) => {

  // base trade class
  bot.Trade = class Trade {
    constructor(_obj, _type) {
      Object.assign(this, _obj)
      this.item = bot.otherItems[this.item_name] || bot.proceduralItems[this.item_name] || bot.clothingItems[this.item_name] || bot.dyeItems[this.item_name]
      this.creator = bot.tradeGuild.members.get(this.user_id)
      if (_type === "store") {
        this.channel = bot.tradeGuild.channels.get(bot.config[`${this.item_type}-categories`][this.item.category])
        this.data = "storeTrades"
        if (bot.config["store-trade-listing-expires"] > 0 && !this.expires) {
          this.expireData = moment().utcOffset(-8).add(bot.config["store-trade-listing-expires"], 'days')
        }
      }
      else {
        this.channel = bot.tradeGuild.channels.get(bot.config["public-trade-channel"])
        this.data = "publicTrades"
        if (bot.config["pub-trade-listing-expires"] > 0 && !this.expires) {
          this.expireData = moment().utcOffset(-8).add(bot.config["pub-trade-listing-expires"], 'days')
        }
      }
      // this.expireData = moment().utcOffset(-8).add(10, 'seconds')

      this.type = _type
      this.buildEmbed()
      if (this.expireData) {
        this.expires = this.expireData.format()
      }
      else if (!this.expires) this.expires = null;
    }

    baseObj() {
      return {
        user_id: this.creator.id,
        item_type: this.item_type,
        item_name: this.item_name,
        item_count: this.item_count,
        item_cost: this.item_cost,
        location: this.location,
        message_id: this.message_id,
        expires: this.expires,
        type: this.type
      }
    }

    async init() {
      try {
        this.message = await this.channel.fetchMessage(this.message_id)
        return this
      } catch (err) {
        bot.logger.error(`${this.message_id}: Error finding message. Assuming it was deleted.`)
        return false
      }
    }

    changeStock(delOne) {
      if (delOne) { // remove one find stock
        if (this.item_count - 1 < 0) return false;
        this.item_count -= 1
      }
      else { // add one
        this.item_count += 1
      }
      bot.Trade.save(this.data)
      this.buildEmbed()
      this.message.edit({embed: this.embed})
      return true
    }

    buildEmbed() {
      this.embed = new bot.Embed()
        .setAuthor(this.creator.nickname || this.creator.user.username, this.creator.user.avatarURL)
        .setTitle(this.item_name)
        .setURL(`https://worldsadrift.gamepedia.com/index.php?search=${this.item_name.replace(/\s/g, "_")}`)
        .setDescription(`\`\`\`fix\n${this.item.description}\`\`\``)
        .addField("Location", this.location, true)
        .addField("Cost", this.item_cost, true)
      if (this.expireData)
        this.embed.setFooter(`Expires: ${this.expireData.format("MM/DD/YY")}`)
      if (this.addToEmbed)
        this.addToEmbed()
    }

    del() {
      bot[this.data] = bot[this.data].filter(t => t.message_id !== this.message_id)
      bot.Trade.save(this.data)
      bot.logger.delListing("Deleted a trade listing", this)
    }

    static save(type) {
      let data = []
      bot[type].forEach(t => {
        data.push(t.obj())
      })
      fs.writeFile(`./configs/${type}.json`, JSON.stringify(data, null, 2), err => {
        if (err) return bot.logger.error(err);
        bot.logger.fileChange(`${type}.json`)
      })
    }
  }

  // basic trade class
  bot.BasicTrade = class BasicTrade extends bot.Trade {
    constructor(_obj, _type) {
      super(_obj, _type)
    }

    addToEmbed() {
      this.embed.setColor("#33cc33")
        .setThumbnail(this.item.image_url)
        .addField("In stock", this.item_count, true)
    }

    obj() {
      return {
        ...this.baseObj(),
        tradeType: this.constructor.name
      }
    }
  }

  // trade class for procedurals
  bot.ProceduralTrade = class ProceduralTrade extends bot.Trade {
    constructor(_obj, _type) {
      super(_obj, _type)
      this.embed.setColor("#ff3300")
    }

    addToEmbed() {
      let output = `\`\`\`asciidoc\n`
      let statNames = Object.keys(this.stats)
      let longest = statNames.reduce((long, str) => Math.max(long, str.length), 0)
      for (let i = 0; i < statNames.length; i++) {
        output += `${statNames[i]}${" ".repeat(longest - statNames[i].length)} :: ${" ".repeat(3-String(this.stats[statNames[i]]).length)}${this.stats[statNames[i]]}\n`
      }
      output += "```"
      this.embed.addField("Stats", output.trim())
      this.embed.setTitle(this.procedural_name)
      this.embed.setThumbnail(this.item.image_url)
    }

    obj() {
      return {
        ...this.baseObj(),
        procedural_name: this.procedural_name,
        stats: this.stats,
        tradeType: this.constructor.name
      }
    }
  }

  bot.ColorTrade = class ColorTrade extends bot.Trade {
    constructor(_obj, _type) {
      super(_obj, _type)
      this.embed.setColor("#bf42f4")
    }

    addToEmbed() {
      this.embed.setThumbnail(this.item.image_url)
        .addField("Quantity", this.quantity, true)
        .addField("Color", this.color, true)
    }

    obj() {
      return {
        ...this.baseObj(),
        color: this.color,
        tradeType: this.constructor.name
      }
    }
  }

  // trade class for clothing
  bot.ClothingTrade = class ClothingTrade extends bot.Trade {
    constructor(_obj, _type) {
      super(_obj, _type)
      this.embed.setColor("#ffffff")
    }

    addToEmbed() {
      this.embed.setThumbnail(this.item.image_url)
      if (this.imageOrText === "text")
        this.embed.addField("Color", this.imageOrTextValue, true)
      else if (this.imageOrText === "image")
        this.embed.setImage(this.imageOrTextValue)
    }

    obj() {
      return {
        ...this.baseObj(),
        imageOrText: this.imageOrText,
        imageOrTextValue: this.imageOrTextValue,
        tradeType: this.constructor.name
      }
    }
  }
}
