
var scrape = require("./scrape.js");

exports.mount = function(app) {
  app.get("/eckhart/list-issues", listIssues);
  app.get("/eckhart/list-videos/:issueId", listVideos);
  app.get("/eckhart/get-video/:videoId", getVideo);
}

function listIssues(req, res) {
  return scrape.listIssues()
    .then(issues => res.set("Cache-Control", "max-age=86400, public").json(issues))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    })
}

function listVideos(req, res) {
  return scrape.listVideos(req.params.issueId)
    .then(videos => res.set("Cache-Control", "max-age=8640000, public").json(videos))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    })
}

function getVideo(req, res) {
  return scrape.getVideo(req.params.videoId)
    .then(file => res.set("Cache-Control", "max-age=8640000, public").sendFile(file, {cacheControl: false}))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    })
}
