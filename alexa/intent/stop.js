
var log = require("loglevel");

exports.handle = function(req, ses) {
  log.debug("StopIntent");
  return Promise.resolve(ses).then(handle);
}

function handle(ses) {
  if (ses.videoIndex != null) {
    ses.videoIndex = null;
    return {
      text: "Okay.",
      title: "Stop",
      reprompt: "Please select another video or issue.",
      directives: [
        { type: "AudioPlayer.Stop" }
      ]
    }
  }
  else {
    return {
      text: "Goodbye.",
      title: "Stop",
      directives: [
        { type: "AudioPlayer.Stop" }
      ],
      shouldEndSession: true
    }
  }
}
