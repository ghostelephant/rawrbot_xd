const {MongoClient} = require("mongodb");
const {invalidate, calculateDiff, dbConfig: {dbName, dbConnect}} = require("../utils");

const confirmpitch = async ({msg, args, guildInfo, client}) => {
  if(
    args.length !== 1 ||
    isNaN(args[0]) ||
    parseFloat(args[0]) % 1 ||
    parseInt(args[0]) < 0 ||
    parseInt(args[0]) > 1000
  ){
    return invalidate(msg, "Please enter a valid pitch to confirm.");
  }

  let origPitch;
  try{
    origPitch = guildInfo.currentRound.pitch;
  }
  catch{
    origPitch = undefined;
  }
  if(origPitch === undefined){
    return invalidate("You need to submit a pitch first!");
  }

  const pitch = parseInt(args[0]);
  if(pitch !== origPitch){
    return invalidate(msg, `The pitches didn't match.  Either re-sumbit the pitch with \`${guildInfo.utils.prefix}pitch\` or re-confirm with the correct pitch.`);
  }

  const scores = [];
  const currentRound = guildInfo.currentRound;
  for(let playerId in currentRound){
    if(playerId === "pitch") continue;
    const guess = currentRound[playerId].guess;
    const diff = calculateDiff(pitch, guess);
    currentRound[playerId].diff = diff;
    scores.push({
      playerId,
      guess,
      diff
    });
  }
  scores.sort((a, b) => a.diff - b.diff);

  let note = "```\n";
  for(let guessObj of scores){
    const {playerId, guess, diff} = guessObj;
    const playerName = guildInfo.utils.playerNicknames[playerId];
    note += `${playerName} guessed ${guess}, for a diff of ${diff}\n`;
  };
  
  const channel = client.channels.cache.get(msg.channelId);
  channel.send(note + "```");

  const currentSession = guildInfo.currentSession || [];
  currentSession.push(currentRound);

  let reaction;
  const setReaction = emoj => reaction = emoj;
  const mongoClient = new MongoClient(...dbConnect);
  try{
    setReaction("⚾");
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    await coll.updateOne(
      {guildId: msg.guildId},
      {$set: {
        currentSession,
        currentRound: {}
      }}
    ).catch(e => {
      setReaction("❌");
      console.error(`Problem in confirmpitch.js:\n${e}`);
    });
  }
  catch(e){
    console.error(`Problem in confirmpitch.js:\n${e}`);
    setReaction("❌");
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Confirms pitch, (eventually will calculate scores), and advances to the next round.";

module.exports = {
  func: confirmpitch,
  description
};