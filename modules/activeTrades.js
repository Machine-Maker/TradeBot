const fs = require('fs')
const moment = require('moment')

module.exports = (bot) => {
  bot.ActiveTrade = class ActiveTrade {
    constructor(_obj, type = "active") {
      Object.assign(this, _obj)
      this.type = type
      this.complete = {
        trader: false,
        tradee: false
      }
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
        accepted: this.accepted,
        expires: this.expires,
        complete: this.complete,
        type: "active"
      }
    }

    async handleInput(msg, member, cmd_name, args) {
      const cmd = bot.tradeCmds.get(cmd_name)
      if (!(cmd && cmd.conf.enabled)) return;
      let perm = "All"
      if (this.trade.type === "public" && member.id === this.trade.creator.id)
        perm = "Trader"
      else if (this.trade.type === "store" && member.roles.has(bot.config["staff-role"]))
        perm = "Trader"
      else if (this.tradee.id === member.id)
        perm = "Tradee"
      if (cmd.conf.adminOnly && !member.permissions.has("ADMINISTRATOR", true)) return;
      if (!(cmd.conf.permLevel.includes(perm)) && !cmd.conf.adminOnly) return;
      cmd.run(bot, msg, args, this, perm, member)
    }

    async start(tradee) {
      this.accepted = false
      this.tradee = tradee
      const perms = [] // permission creation
      const ids = [bot.config["staff-role"], tradee.id, this.trade.creator.id]
      ids.forEach(id => {
        perms.push({allowed: "VIEW_CHANNEL", id: id})
      })
      perms.push({denied: "VIEW_CHANNEL", id: bot.tradeGuild.roles.find(r => r.name === "@everyone").id})
      try { // create channel and apply settings
        this.channel = await bot.tradeGuild.createChannel(this.trade.item_name, "text", perms)
        this.channel_id = this.channel.id
        await this.channel.setParent(bot.tradeCategory[this.trade.type])
        const traderName = this.trade.type === "store" ? "Store" : this.trade.creator.nickname || this.trade.creator.user.username
        await this.channel.setTopic(`[${traderName}] trading with [${tradee.nickname || tradee.user.username}] Date initiated: ${bot.date(-8)}`)
        bot.activeTrades.push(this)
        const activeEmbed = new bot.Embed(Object.assign({}, this.trade.embed))
        activeEmbed.fields = activeEmbed.fields.filter(f => f.name !== "In stock")

        if (this.trade.type === "store" && bot.config["store-trade-active-expires"] > 0) {
          this.expireData = moment().utcOffset(-8).add(bot.config["store-trade-active-expires"], 'days')
        }
        else if (this.trade.type === "public" && bot.config["pub-trade-active-expires"] > 0) {
          this.expireData = moment().utcOffset(-8).add(bot.config["pub-trade-active-expires"], 'days')
        }
        // this.expireData = moment().utcOffset(-8).add(10, 'seconds')

        if (this.expireData) {
          this.expires = this.expireData.format()
          activeEmbed.addField("Expires", this.expireData.format("MM/DD/YY"), true)
        }
        else
          this.expires = null

        activeEmbed.setTimestamp()
          .addField("\u200b", "```yaml\nYou can negotiate a price/meetup location here. Type !help for a list of commands you have access to here```")

        delete activeEmbed.footer
        bot.ActiveTrade.save()

        const trader = this.trade.type === "store" ? bot.tradeGuild.roles.get(bot.config["staff-role"]) : this.trade.creator
        await this.channel.send(`${trader}, ${this.tradee} has requested to trade for`, {embed: activeEmbed})
        bot.logger.newActive("Created a new active trade", this)

      } catch (err) {
        bot.logger.error("Error creating a active trade channel!")
        bot.logger.error(err)
        if (this.channel)
          this.channel.delete()
      }
    }

    del(isCancel = false) {
      if (isCancel) {
        this.trade.changeStock(false)
      }
      if (this.trade.type === "public" && this.trade.item_count === 0) {
        const otherActives = bot.activeTrades.filter(t => t.trade.message_id === this.trade.message_id && t.channel_id !== this.channel_id)
        if (otherActives.length < 1) this.trade.message.delete();

      }
      bot.activeTrades = bot.activeTrades.filter(t => t.channel_id !== this.channel_id)
      bot.ActiveTrade.save()
      bot.logger.delActive("Deleted an active trade", this)
    }

    static save() {
      let data = []
      bot.activeTrades.forEach(t => {
        data.push(t.obj())
      })
      fs.writeFile("./configs/activeTrades.json", JSON.stringify(data, null, 2), err => {
        if (err) return bot.logger.error(err);
        bot.logger.fileChange("activeTrades.json")
      })
    }
  }
}
