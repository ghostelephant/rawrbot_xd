const help = ({msg, client, guildInfo}) => {
  const commands = require("./index");
  const prefix = guildInfo.utils.prefix;

  const key_length = Math.max(...Object.keys(commands).map(cmd => cmd.length)) + prefix.length + 2;
  let helpMessage = "```";
  for(let command in commands){
    let line = prefix + command;
    line += " ".repeat(key_length - line.length);
    line += "|  "
    line += commands[command].description + "\n\n";
    helpMessage += line;
  }
  
  const channel = client.channels.cache.get(msg.channelId);
  channel.send(helpMessage + "```");
};

const description = "Shows this message";

module.exports = {
  func: help,
  description
};