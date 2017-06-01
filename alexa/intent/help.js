
var log = require("loglevel");

exports.handle = function(req, ses) {
  log.debug("Help");

  var issueNumber = Math.floor(Math.random() *50) +1;
  return Promise.resolve({
    text: `You can say for example: 'open issue number ${issueNumber}', or 'play the first video in issue ${issueNumber}'.`,
    title: "Help",
    reprompt: "What would you like to do?"
  })
}
