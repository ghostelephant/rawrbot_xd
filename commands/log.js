const log = ({msg, args}) => {
  let thing = msg;
  while(args.length){
    try{
      thing = thing[args.shift()];
    }
    catch (e){
      console.error(`Problem in log.js:\n${e}`);
      return msg.react("❌");
    }
  }
  console.log(thing);
  msg.react("📝");
}

description = "Logs the specified information to the back end";

module.exports = {
  func: log,
  description
};