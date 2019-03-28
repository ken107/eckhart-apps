
var log = require("loglevel");
const axios = require("axios");

exports.load = async function(issueId) {
  log.debug("issue", "load", issueId);
  const res = await axios({
    method: "POST",
    url: "https://service.lsdsoftware.com/eckhart-videos?capabilities=1.0",
    data: {method: "listVideos", issueId},
    timeout: 15*1000
  })
  return res.data;
}
