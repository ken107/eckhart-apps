
var log = require("loglevel");

exports.handle = function(req, ses) {
  log.debug("Launch");
  return require("../loader/issue_list.js").load()
    .then(issueList => {
      return {
        text: `Welcome! There are ${issueList.length} issues, which issue would you like to open?`,
        title: "Welcome",
        reprompt: "You can say 'open issue number 25'."
      };
    })
}
