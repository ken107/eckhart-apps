
var log = require("loglevel");
const axios = require("axios");

exports.load = async function(videoId) {
  log.debug("video", "load", videoId);
  const res = await axios({
    method: "POST",
    url: "https://support.lsdsoftware.com:30299/eckhart-videos?capabilities=1.0&timeout=120000",
    data: {method: "getVideo", videoId},
    timeout: 120000
  })
  return res.data;
}
