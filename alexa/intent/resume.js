
var log = require("loglevel");

exports.handle = function(req, ses) {
  log.debug("Resume");
  return {
    text: `I don't know how to resume yet.`,
    title: "Resume",
    shouldEndSession: true
  }
}
