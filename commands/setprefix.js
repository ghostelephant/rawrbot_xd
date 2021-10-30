const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const setprefix = async ({msg, args, guildInfo}) => {
  
  let superusers;
  try{
    superusers = guildInfo.utils.superusers;
  }
  catch (e){
    console.error(`Problem in setprefix.js:\n${e}`);
    return msg.react("❌");
  }
  
  if(!superusers.includes(msg.author.id)){
    return invalidate(msg, "You do not have permission to do this.");
  }
  
  const newPrefix = args.join(" ");
  if(!newPrefix.length){
    return invalidate(msg, "Please specify a prefix.");
  }
  
  const mongoClient = new MongoClient(...dbConnect);
  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    reaction = "🌵";
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    
    await coll.updateOne(
      {guildId: msg.guildId},
      {$set: {"utils.prefix": newPrefix}}
    ).catch(e => {
      setReaction("❌");
      console.error(`Problem in setprefix.js:\n${e}`);
    });
  }
  catch(e){
    reaction = "❌";
    console.error(`Problem in setprefix.js:\n${e}`);
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Resets the prefix for this server.  Requires superuser privileges."

module.exports = {
  func: setprefix,
  description
}