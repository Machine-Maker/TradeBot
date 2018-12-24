const fs = require('fs')
const moment = require('moment')

module.exports = (bot) => {
  bot.ActiveTrade = class ActiveTrade {
    constructor(_obj, type = "active") {
      Object.assign(this, _obj)
      this.type = type
    }

    async init() {
      try {
        this.channel = bot.tradeGuild.channels.get(this.channel_id)
        this.trade = bot.storeTrades.concat(bot.publicTrades).filter(t => t.message_id === this.trade_id)[0]
        this.tradee = bot.tradeGuild.members.get(this.tradee_id)
        return this
      } catch (err) {
        bot.logger.error(`Error finding channel, trade, or tradee. Assuming the person left, channel was removed, or trade was removed!`)
        return false
      }

    }

    obj() {
      return {
        channel_id: this.channel.id,
        trade_id: this.trade.message_id,
        tradee_id: this.tradee.id,
        tradeType: this.constructor.name,
        type: "active"
      }
    }

    handleInput(msg, cmd, args) {
      console.log("handling input!")
    }

    async start(tradee) {
      this.tradee = tradee
      const perms = [] // permission creation
      const ids = [bot.config["staff-role"].value, tradee.id, this.trade.creator.id]
      ids.forEach(id => {
        perms.push({allowed: "VIEW_CHANNEL", id: id})
      })
      perms.push({denied: "VIEW_CHANNEL", id: bot.tradeGuild.roles.find(r => r.name === "@everyone").id})
      try { // create channel and apply settings
        this.channel = await bot.tradeGuild.createChannel(this.trade.item_name, "text", perms)
        this.channel_id = this.channel.id
        await this.channel.setParent(bot.tradeCategory)
        await this.channel.setTopic(`[${this.trade.creator ? (this.trade.creator.nickname || this.trade.creator.user.username) : "N/A"}] trading with [${tradee.nickname || tradee.user.username}] Date initiated: ${bot.date(-8)}`)
        bot.activeTrades.push(this)
        bot.ActiveTrade.save()

        const activeEmbed = new bot.Embed(Object.assign({}, this.trade.embed))
        activeEmbed.fields = activeEmbed.fields.filter(f => f.name !== "In stock")
        const expireData = moment().utcOffset(-8).add(bot.config["trade-expiration"].value, 'days')
        activeEmbed.addField("Expires", expireData.format("MM/DD/YY"), true)
          .setTimestamp()
          .addField("\u200b", "```yaml\nYou can negotiate a price/meetup location here. Type !help for a list of commands you have access to here```")

        await this.channel.send(`${this.trade.creator}, ${this.tradee} has requested to trade for`, {embed: activeEmbed})
        bot.logger.log(`Started a trade between ${this.trade.creator.user.username} and ${tradee.user.username}`)

      } catch (err) {
        bot.logger.error("Error creating a active trade channel!")
        bot.logger.error(err)
      }
    }

    del() {
      bot.activeTrades = bot.activeTrades.filter(t => t.channel_id !== this.channel_id)
      bot.ActiveTrade.save()
      bot.logger.warn(`Deleted a active trade between ${this.trade.creator.nickname || this.trade.creator.user.username} and ${this.tradee.nickname || this.tradee.user.username}!`)
    }

    static save() {
      let data = []
      bot.activeTrades.forEach(t => {
        data.push(t.obj())
      })
      fs.writeFile("./configs/activeTrades.json", JSON.stringify(data, null, 2), err => {
        if (err) return bot.logger.error(err);
        bot.logger.log(`Updated activeTrades.json!`)
      })
    }
  }
}
