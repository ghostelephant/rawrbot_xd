require("dotenv").config();
const {MongoClient} = require("mongodb");
const dbName = process.env.DB_NAME || "rawrball_xd";
const connectionString = process.env.CLOUD_DB_STRING || `mongodb://localhost/${dbName}`;

const unstore = async ({msg, args}) => {
  const userId = msg.author.id;
  const connectionOptions = {useNewUrlParser: true, useUnifiedTopology: true };
  const mongoClient = new MongoClient(connectionString, connectionOptions);

  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("test");
    const list = await coll.find({userId}).toArray()
      .catch(e => {
        console.error(`Problem in unstore.js:\n${e}`);
        setReaction("❌");
      });

    if(list.length){
      let updatedItems;
      const successes = [];
      const fails = [];
      let response = "";

      if(args.length){
        updatedItems = list[0].storedItems;
        for(let key of args){
          if(key in updatedItems){
            delete updatedItems[key];
            successes.push(key);
          }
          else{
            fails.push(key);
          }
        }
        if(successes.length){
          response += `Successfully deleted:\n${
            successes.map(s => "`" + s + "`").join("\n")
          }`;
        }
        if(fails.length){
          response += response.length ? "\n" : "";
          response += `Could not find:\n${
            fails.map(s => "`" + s + "`").join("\n")
          }`;
        }
      }
      else{ // no arguments given: delete all
        updatedItems = {};
        response += "Successfully deleted all items."
      }
      await coll.updateOne({userId}, {$set: {storedItems: updatedItems}});

      msg.reply(response);
    }
    else{ // !list.length
      msg.reply("You do not have anything saved in the database.");
    }

    reaction = "✅";
  }
  catch{
    reaction = "❌";
    console.error(`Problem in unstore.js:\n${e}`)
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Removes an item from the user's stores.\n" +
"&&&&&| With one argument, that specific key is deleted.\n" +
"&&&&&| With no arguments, the user's full stores are deleted.";

module.exports = {
  func: unstore,
  description
};