
var log = require("loglevel");

exports.handle = function(req, ses) {
  log.debug("SelectVideo");

  return require("./select_issue.js").getIssue(req, ses)
    .then(issue => {
      if (req.videoIndex == null) throw new Error("BAD_VIDEO_INDEX");
      else {
        if (req.videoIndex == "next") {
          if (ses.videoIndex == null) ses.videoIndex = 0;
          else if (ses.videoIndex+1 >= issue.videoList.length) throw new Error("NO_MORE_VIDEOS");
          else ses.videoIndex++;
        }
        else if (req.videoIndex == "previous") {
          if (ses.videoIndex == null) ses.videoIndex = issue.videoList.length-1;
          else if (ses.videoIndex-1 < 0) throw new Error("NO_MORE_VIDEOS");
          else ses.videoIndex--;
        }
        else ses.videoIndex = req.videoIndex;
      }
      return issue.videoList[ses.videoIndex];
    })
    .then(video => {
      return {
        text: video.title,
        title: 'Video',
        directives: [
          {
            type: "AudioPlayer.Play",
            playBehavior: "REPLACE_ALL",
            audioItem: {
              stream: {
                token: "123",
                url: `https://d13iqryjd9nb3p.cloudfront.net/eckhart/get-video/${video.id}`,
                offsetInMilliseconds: 0
              }
            }
          }
        ],
        shouldEndSession: true
      }
    })
};
