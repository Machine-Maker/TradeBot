module.exports = async (bot, msg) => {
  if (msg.author.bot) return;
  const args = msg.content.slice(bot.config.prefix.length).trim().split(/\s+/g)
  const cmd_name = args.shift().toLowerCase()
  const guild = bot.guilds.get(bot.settings.guildID)
  if (!guild || !guild.members.get(msg.author.id)) return;
  const member = guild.members.get(msg.author.id)

  if (!msg.content.startsWith(bot.config.prefix)) return;
    const activeTrade = bot.activeTrades.filter(t => t.channel_id === msg.channel.id)[0]
    if (activeTrade)
      return activeTrade.handleInput(msg, member, cmd_name, args)

    const obj = bot.inUse.find(o => o.id === msg.channel.id)
    if (obj) return;

    const cmd = bot.cmds.get(cmd_name) || bot.cmds.get(bot.aliases.get(cmd_name))
    if (!(cmd && cmd.conf.enabled) || (!msg.guild && cmd.conf.guildOnly)) return;
    let perm = bot.getPermLevel(member)
    if ((perm !== "Owner" && perm !== "Admin") && bot.config["debug-mode"]) perm = "None";
    if (!cmd.conf.permLevel.includes(perm)) return; // perm check
    cmd.run(bot, msg, args)
}
