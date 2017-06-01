
var log = require("loglevel");

exports.handle = function(req, ses) {
  log.debug("Previous");
  return require("./select_video.js").handle({videoIndex: "previous"}, ses);
}
