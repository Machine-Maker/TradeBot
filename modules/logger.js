const chalk = require('chalk')
const moment = require('moment')

module.exports.log = (content, type = "log") => {
  const timestamp = `[${moment().utcOffset(-8).format('MM/DD/YY HH:mm:ss')}]:`
  switch (type) {
    case "log":
      return console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `)
    case "warn":
      return console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `)
    case "error":
      if (typeof content === "object")
        return console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content.toString()} `)
      return console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `)
    case "debug":
      return console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `)
    case "cmd":
      return console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`)
    case "ready":
      return console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`)
    default: throw new TypeError("Logger type must be either warn, debug, log, ready, cmd or error.")
  }
}

module.exports.error = (...args) => this.log(...args, "error")

module.exports.warn = (...args) => this.log(...args, "warn");

module.exports.debug = (...args) => this.log(...args, "debug");

module.exports.cmd = (...args) => this.log(...args, "cmd");
