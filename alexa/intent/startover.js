
var log = require("loglevel");

exports.handle = function(req, ses) {
  log.debug("StartOver");
  return require("./select_video.js").handle({videoIndex: ses.videoIndex}, ses);
}
