const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const store = async ({msg, args}) => {
  if(args.length < 2){
    return invalidate(msg, "Must include at least two words after `store`.");
  }

  const userId = msg.author.id;

  const [key, ...value] = args;
  const newStoredItem = {
    [key]: value.join(" ")
  };

  const mongoClient = new MongoClient(...dbConnect);

  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("test");
    const list = await coll.find({userId}).toArray();

    if(!list.length){
      reaction = "✅";
      await coll.insertOne({
        userId,
        storedItems: newStoredItem
      })
        .catch(e => {
          console.error(`Problem in store.js:\n${e}`);
          setReaction("❌");
        });
    }
    else {
      const updatedItems = {
        ...list[0].storedItems,
        ...newStoredItem
      }
      await coll.updateOne({userId}, {$set: {storedItems: updatedItems}});
      reaction = "✅";
    }
  }
  catch (e) {
    reaction = "❌";
    console.error(`Problem in store.js:\n${e}`)
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Save things to a Mongo database.  First word after \"store\" is the key, the rest is the value."

module.exports = {
  func: store,
  description
};
