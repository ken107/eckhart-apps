
var log = require("loglevel");
const axios = require("axios");

exports.load = async function() {
  log.debug("issue-list", "load");
  const res = await axios({
    method: "POST",
    url: "https://service.lsdsoftware.com/eckhart-videos?capabilities=1.0",
    data: {method: "listIssues"},
    timeout: 15*1000
  })
  return res.data;
}
