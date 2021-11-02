const leaderboard = async({msg, guildInfo, client}, final = false) => {
  const thisSession = guildInfo.currentSession;
  scores = {};
  for(let round of thisSession){
    for(let playerId in round){
      if(playerId === "pitch") continue;
      if(!(playerId in scores)){
        scores[playerId] = 0;
      }
      scores[playerId] += round[playerId].score;
    }
  }

  let lb = (final ?
    "**FINAL SESSION STANDINGS:**"
    :
    "**LEADERBOARD:**"
  );
  lb += "```\nPlayer       | Score\n";
  lb += "-------------|------\n"
  for(let playerId of Object.keys(scores).sort((a, b) => scores[b] - scores[a])){
    playerName = guildInfo.utils.playerNicknames[playerId];
    lb += `${playerName} | ${scores[playerId]}\n`
  }

  const channel = client.channels.cache.get(msg.channelId);
  channel.send(lb + "\n```");
}

const description = "Shows the standings in the current session";

module.exports = {
  func: leaderboard,
  description
};