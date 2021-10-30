const go = ({msg, client, args}) => {
  if(args.join(" ") === "tigers"){
    const channel = client.channels.cache.get(msg.channelId);
    channel.send(":rallygoose: :rallygoose: :rallygoose:")
      .then( post => {
        post.react("🐯");
        post.react("🐅");
      }).catch( e => console.error(`Problem in gotigers.js:\n${e}`));
  }
  else{
    msg.reply("What?  No, go Tigers! :cactus: :cactus: :cactus:");
  }
};

const description = "Posts three rally geese";

module.exports = {
  func: go,
  description
};