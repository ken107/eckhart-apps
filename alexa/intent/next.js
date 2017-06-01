
var log = require("loglevel");

exports.handle = function(req, ses) {
  log.debug("Next");
  return require("./select_video.js").handle({videoIndex: "next"}, ses);
}
