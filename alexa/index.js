
var config = require("./config.json");
var log = require("loglevel");

var handlers = {
  Launch: require("./intent/launch.js"),
  SelectIssue: require("./intent/select_issue.js"),
  SelectVideo: require("./intent/select_video.js"),
  "AMAZON.PauseIntent": require("./intent/pause.js"),
  "AMAZON.ResumeIntent": require("./intent/resume.js"),
  "AMAZON.NextIntent": require("./intent/next.js"),
  "AMAZON.PreviousIntent": require("./intent/previous.js"),
  "AMAZON.StartOverIntent": require("./intent/startover.js"),
  "AMAZON.StopIntent": require("./intent/stop.js"),
  "AMAZON.CancelIntent": require("./intent/stop.js"),
  "AMAZON.HelpIntent": require("./intent/help.js"),
};

log.setLevel("debug");

exports.handler = function(event, context, callback) {
  switch (event.request.type) {
    case 'LaunchRequest':
      handle({intent: {name: "Launch"}, slots: {}}, event.session)
        .then(res => callback(null, res));
      break;
    case 'IntentRequest':
      handle(event.request, event.session)
        .then(res => callback(null, res));
      break;
    case 'SessionEndedRequest':
      callback();
      break;
  }
};

function handle(request, session) {
  var req = unwrapRequest(request);
  var ses = unwrapSession(session);
  log.info(req, ses);

  return Promise.resolve()
    .then(() => handlers[req.intent].handle(req, ses))
    .catch(err => {
      log.error(err.stack);
      return getErrorResponse(err, ses);
    })
    .then(res => {
      log.debug(res);
      return wrapResponse(res, ses);
    });
}

function unwrapRequest(request) {
  var req = {
    intent: request.intent.name
  };
  for (var name in request.intent.slots) {
    var slot = request.intent.slots[name];
    if (name == "issueNumber") {
      req.issueIndex = slot.value ? slot.value-1 : null;
    }
    else if (name == "videoPosition") {
      if (slot.value == "next" || slot.value == "previous") req.videoIndex = slot.value;
      else {
        req.videoIndex = config.positions.indexOf(slot.value);
        if (req.videoIndex == -1) req.videoIndex = config.positions2.indexOf(slot.value);
      }
    }
  }
  return req;
}

function unwrapSession(session) {
  return session.attributes || {};
}

function wrapResponse(res, ses) {
  return {
    version: '1.0',
    sessionAttributes: ses,
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: res.text,
      },
      card: {
        type: 'Simple',
        title: res.title || "Info",
        content: res.text,
      },
      reprompt: {
        outputSpeech: {
          type: 'PlainText',
          text: res.reprompt || "I'm waiting for your response",
        },
      },
      directives: res.directives,
      shouldEndSession: res.shouldEndSession || false,
    },
  };
}

function getErrorResponse(err, ses) {
  switch (err.message) {
    case "NO_ISSUE_SELECTED":
      return {
        text: "You haven't selected an issue, please select an issue first.",
        title: "No issue selected",
        reprompt: "You can say 'open issue number 1'."
      }
    case "BAD_ISSUE_INDEX":
      return {
        text: "Issue not found, please select another issue.",
        title: "Invalid issue number",
        reprompt: "You can say 'open issue number five'."
      };
    case "BAD_VIDEO_INDEX":
      return {
        text: "Video not found, please select another video.",
        title: "Invalid video position",
        reprompt: "You can say 'play the first video'."
      };
    case "NO_MORE_VIDEOS":
      return {
        text: "There are no more videos in this issue. Please select another issue.",
        title: "No more videos",
        reprompt: "You can say 'issue number 45'."
      };
    default:
      return {
        text: "An error has occurred with the previous request. Please check error logs.",
        title: "Error",
        reprompt: "Which issue would you like to open?"
      };
  }
}
