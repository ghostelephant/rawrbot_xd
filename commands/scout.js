const axios = require("axios");
const {invalidate, processPitchingData} = require("../utils");

const scout = async ({msg, args, client}) => {
  try{
    // Get list of pitchers that match term
    const searchTerm = args.join(" ").toLowerCase();
    const {data: players} = await axios.get(
      `${process.env.MLR_API}/players`
    );
    const matches = players.filter(pitcher =>
      pitcher.playerName.toLowerCase().includes(searchTerm)
    );

    // Invalidate if matches doesn't equal 1
    if(matches.length === 0){
      return invalidate(msg, "Could not find this player");
    }
    if(matches.length > 1){
      const numMatches = matches.length;
      const options = matches
        .slice(0, 10)
        .map(player => player.playerName)
      if(numMatches > 10) options.push("...");
      return invalidate(
        msg,
        `Found too many matches:\n> ${options.join("\n> ")}`
      );
    }

    const {playerID, playerName} = matches[0];
    const {data: pasAsPitcher} = await axios.get(
      `${process.env.MLR_API}/plateappearances/pitching/mlr/${playerID}`
    );
    const post = (pasAsPitcher.length ?
      "```\n"
      + playerName + "\n\n"
      + processPitchingData(pasAsPitcher)
      + "```"
      :
      "This player has no pitching data"
    );
    
    const channel = client.channels.cache.get(msg.channelId);
    channel.send(post);
  }
  catch(e){
    console.log(e);
    invalidate(msg, "Sorry, an error occurred.");
  }
};

const description = "Show scouting info for pitcher";

module.exports = {
  func: scout,
  description
};