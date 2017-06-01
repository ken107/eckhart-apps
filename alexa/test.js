
var log = require("loglevel")
var tests = {};

log.setLevel("debug");

tests.launch = function() {
  return require("./intent/launch.js").handle({}, {})
    .then(console.log).catch(console.error)
}

tests.selectIssue = function(issueIndex) {
  return require("./intent/select_issue.js").handle({issueIndex: Number(issueIndex)}, {})
    .then(console.log).catch(console.error)
}

tests.selectVideo = function(issueIndex, videoIndex) {
  return require("./intent/select_video.js").handle({issueIndex: Number(issueIndex), videoIndex: Number(videoIndex)}, {})
    .then(console.log).catch(console.error)
}

tests.selectVideo2 = function(issueIndex, videoIndex) {
  var ses = {};
  return require("./intent/select_issue.js").handle({issueIndex: Number(issueIndex)}, ses)
    .then(() => require("./intent/select_video.js").handle({videoIndex: Number(videoIndex)}, ses))
    .then(console.log).catch(console.error)
}

tests.stop = function() {
  return require("./intent/stop.js").handle({}, {})
    .then(console.log).catch(console.error)
}

tests.stop2 = function() {
  return require("./intent/stop.js").handle({}, {videoIndex: 1})
    .then(console.log).catch(console.error)
}

tests.help = function() {
  return require("./intent/help.js").handle({}, {})
    .then(console.log).catch(console.error)
}

tests.temp = function() {
  return require("./index.js").handler({
    "session": {
      "sessionId": "SessionId.68568c53-dabb-41fe-81e4-b9203323ff2c",
      "application": {
        "applicationId": "amzn1.ask.skill.ecdb6ccf-8d1a-4797-ad52-887c06519b90"
      },
      "attributes": {},
      "user": {
        "userId": "amzn1.ask.account.AFYC4S5Y5SG644V46ODVVT65DF7247MJLAVKHUQBMYZE7IH64KBDDCXGVC77PTQ5DPBF7TZO5OJJRZGUOKP6R2KU7UX5OPVSOXZAT5OSXW5UUVUKOLZQQHCI34ZM6PC53YW4IWJUEIEK2XY2OYN4AFCNIXLNYBKQJJGBZZUBR2VG56LCX2OEEDTSJDOQMEGXRGCHA7EHHDEM4AQ"
      },
      "new": true
    },
    "request": {
      "type": "IntentRequest",
      "requestId": "EdwRequestId.cd815704-3bdd-4d78-86b2-2dcae01c2acc",
      "locale": "en-US",
      "timestamp": "2017-06-01T18:43:16Z",
      "intent": {
        "name": "SelectIssue",
        "slots": {
          "issueNumber": {
            "name": "issueNumber",
            "value": "?"
          }
        }
      }
    },
    "version": "1.0"
  }, {}, console.log);
}



if (process.argv.length < 3) throw new Error("Need test name");
tests[process.argv[2]].apply(null, process.argv.slice(3));
