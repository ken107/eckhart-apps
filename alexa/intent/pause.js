
var log = require("loglevel");

exports.handle = function(req, ses) {
  log.debug("Pause");
  return {
    text: `I don't know how to pause yet.`,
    title: "Pause",
    shouldEndSession: true
  }
}
