const {MongoClient} = require("mongodb");
const {
  invalidate,
  calculateDiff,
  calculateScore,
  dbConfig: {dbName, dbConnect}
} = require("../utils");

const right = (num, width) => {
  let str = num.toString();
  return " ".repeat(width - str.length) + str;
};

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
    const score = calculateScore(diff);
    currentRound[playerId].diff = diff;
    currentRound[playerId].score = score;
    scores.push({
      playerId,
      guess,
      diff,
      score
    });
  }
  scores.sort((a, b) => a.diff - b.diff);

  let note = "**ROUND SUMMARY:**";
  note += "```" + `PITCH: ${pitch}`
  note += "\nPlayer       | Guess | Diff | Score\n";
  note += "-------------|-------|------|------";
  for(let guessObj of scores){
    const {playerId, guess, diff, score} = guessObj;
    const playerName = guildInfo.utils.playerNicknames[playerId];
    note += `\n${playerName} | ${right(guess, 5)} | ${right(diff, 4)} | ${right(score, 5)}`;
    if(score === -5){
      note += " 😬";
    }
  };
  
  const channel = client.channels.cache.get(msg.channelId);
  channel.send(note + "\n```");

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