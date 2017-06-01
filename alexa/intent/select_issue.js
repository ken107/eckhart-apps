
var log = require("loglevel");
var config = require("../config.json");

module.exports = {
  handle: handle,
  getIssue: getIssue
};

function handle(req, ses) {
  log.debug("SelectIssue");
  return getIssue(req, ses)
    .then(issue => {
      return {
        text: `Issue ${ses.issueIndex+1}.\n${issue.title}.\n\n` + issue.videoList.map((video, index) => `${config.positions[index]} video.\n${video.title}.`).join("\n\n") + "\n\nWhich video would you like to play?",
        title: 'Issue',
        reprompt: "You can say 'play the first video'."
      }
    })
}

function getIssue(req, ses) {
  return require("../loader/issue_list.js").load()
    .then(issueList => {
      if (req.issueIndex != null) {
        if (!issueList[req.issueIndex]) throw new Error("BAD_ISSUE_INDEX");
        ses.issueIndex = req.issueIndex;
      }
      else {
        if (ses.issueIndex == null) throw new Error("NO_ISSUE_SELECTED");
      }
      return issueList[ses.issueIndex];
    })
    .then(issue => {
      if (!issue.videoList) {
        return require("../loader/issue.js").load(issue.id)
          .then(videoList => {
            issue.videoList = videoList;
            return issue;
          })
      }
      else return issue;
    })
}
