const store = async ({msg, args}) => {
  const {invalidate} = require("../utils");
  if(args.length < 2){
    return invalidate(msg, "Must include at least two words.");
  }
  const userId = msg.author.id;
  const [key, ...valueArr] = args;

  const utils = require("../utils");
  utils.saveToDatabase({
    collName: "test",
    update: {$set: {
      [`storedItems.${key}`]: valueArr.join(" ")
    }},
    identifier: {userId},
    reactions: {
      success: "✅",
      fail: "❌"
    }
  })
    .then(reaction => msg.react(reaction))
    .catch(e => {
      msg.react("🚫");
      console.error(`Problem in storewithutil.js:\n${e}`)
    });
};

const description = "Save things to a Mongo database.  First word after \"store\" is the key, the rest is the value."

module.exports = {
  func: store,
  description
};