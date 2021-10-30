const {MongoClient} = require("mongodb");
const {dbName, dbConnect} = require("../utils").dbConfig;

const mystores = async ({msg, guildInfo}) => {
  const noStores = () => msg.reply(`You do not have any stores in the database.  Use \`${guildInfo.utils.prefix}store\` to add items.`);

  const userId = msg.author.id;

  const mongoClient = new MongoClient(...dbConnect);

  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("test");
    const list = await coll.find({userId}).toArray()
      .catch(e => {
        setReaction("❌");
        console.error(`Problem in mystores.js:\n${e}`)
      });

    if(!list.length){
      return noStores();
    }

    const storedItems = list[0].storedItems;
    const keys = Object.keys(storedItems);
    if(!keys.length){
      return noStores();
    }
    const displayLength = Math.max(...keys.map(key => key.length)) + 3;
    let output = "Here are your stored items:\n```\n";
    for(let key of keys){
      let lineIntro = key + ":";
      while(lineIntro.length < displayLength){
        lineIntro += " ";
      }
      output += lineIntro + `${storedItems[key]}\n`;
    }
    output += "```";
    msg.reply(output);
    reaction = "👁️";
  }
  catch(e) {
    reaction = "❌";
    console.error(`Problem in mystores.js:\n${e}`)
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Lets a user view items they have saved into the database";

module.exports = {
  func: mystores,
  description
};