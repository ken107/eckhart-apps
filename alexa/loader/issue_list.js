
var log = require("loglevel");

exports.load = function() {
  log.debug("issue-list", "load");

  return new Promise(function(fulfill, reject) {
    require("https").get({
      hostname: "support.lsdsoftware.com",
      port: 30112,
      path: "/eckhart/list-issues"
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
