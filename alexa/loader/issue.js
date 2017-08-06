
var log = require("loglevel");

exports.load = function(issueId) {
  log.debug("issue", "load", issueId);

  return new Promise(function(fulfill, reject) {
    require("https").get({
      hostname: "support.lsdsoftware.com",
      path: `/eckhart/list-videos/${issueId}`
    },
    res => {
      if (res.statusCode == 200) {
        var chunks = [];
        res.on("data", chunk => chunks.push(chunk));
        res.on("end", () => fulfill(JSON.parse(Buffer.concat(chunks).toString())));
      }
      else reject(new Error(`Server returns ${res.statusCode}`));
    })
    .on("error", reject);
  })
}
