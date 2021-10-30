const invalidate = (msg, reason) => {
  msg.react("🚫");
  msg.reply(reason);
};

module.exports = invalidate;