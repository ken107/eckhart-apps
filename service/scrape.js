var os = require("os"),
  fs = require("fs"),
  path = require("path"),
  creds = require(path.join(os.homedir(), ".services", "credentials.json")).etv;

var AWS = require("aws-sdk"),
  s3 = new AWS.S3({credentials: new AWS.SharedIniFileCredentials({profile: "services"})});

//require("request-debug")(require("request"));

module.exports = {
  listIssues: listIssues,
  listVideos: listVideos,
  getVideo: getVideo
};

function login() {
  return request({
      method: "POST",
      url: "https://www.eckharttollenow.com/login-now/default.aspx?a=submit&v4=1&t=&d=&u=",
      form: {
        email: creds.email,
        password: creds.password,
        remember: 1
      }
    })
    .then(res =>  {
      if (is2xx(res)) return parse(res.body);
      else throw new Error(`Server returns ${res.statusCode}`);
    })
  function parse(text) {
    var result = JSON.parse(text);
    if (result.code == "OK") return null;
    else throw new Error(`Webservice returns ${result.code}`);
  }
}

function listIssues() {
  return request("https://www.eckharttollenow.com/v4/member/dashboard/?a=loadcontrol&wid=v4_issuerowvideos_box&refid=")
    .then(res => {
      if (is2xx(res)) return parse(res.body);
      else if (isRedirectToLogin(res)) return login().then(listIssues);
      else throw new Error(`Server returns ${res.statusCode}`);
    })
  function parse(text) {
    var result = JSON.parse(text);
    if (result.code == "OK") {
      var $ = require("cheerio").load(result.data);
      return $(".item").get().map(function(item) {
        return {
          id: $(".thumb_video", item).attr("id").substr(6),
          title: $(".title h3", item).text().trim(),
        }
      })
    }
    else throw new Error(`Webservice returns ${result.code}`);
  }
}

function listVideos(issueId) {
  return request(`https://www.eckharttollenow.com/v4/member/dashboard/?a=issuevideos&issue=${issueId}`)
    .then(res => {
      if (is2xx(res)) return parse(res.body);
      else if (isRedirectToLogin(res)) return login().then(() => listVideos(issueId));
      else throw new Error(`Server returns ${res.statusCode}`);
    })
  function parse(text) {
    var result = JSON.parse(text);
    if (result.code == "OK") {
      return result.data.map(function(item) {
        return {
          id: item.ID,
          title: item.Title,
          description: item.Description,
          duration: item.Duration
        }
      })
    }
    else throw new Error(`Webservice returns ${result.code}`);
  }
}

function getVideo(videoId) {
  return request(`https://www.eckharttollenow.com/v4/member/my/downloads/dl/?vid=${videoId}&type=Audio&format=MP3&quality=REGULAR`)
    .then(res => {
      if (is2xx(res)) return parse(res.body);
      else if (isRedirectToLogin(res)) return login().then(() => getVideo(videoId));
      else throw new Error(`Server returns ${res.statusCode}`);
    })
    .then(url => {
      var filename = path.basename(require("url").parse(url).pathname);
      return checkExistsInS3(filename)
        .then(exists => exists || downloadAndWriteToS3(url, filename))
        .then(() => `https://s3.amazonaws.com/etnow/${filename}`)
    })
  function parse(text) {
    var m = text.match(/'(http:.*?)'/);
    if (m) return m[1];
    else throw new Error("Video URL not found");
  }
  function checkExistsInS3(key) {
    return new Promise(function(fulfill, reject) {
      s3.headObject({Bucket: "etnow", Key: key}, function(err, data) {
        if (!err) fulfill(true);
        else if (err.code == "NotFound") fulfill(false);
        else reject(err);
      })
    })
  }
  function downloadAndWriteToS3(url, key) {
    console.log("Downloading", url);
    var tmpFile = path.join(process.cwd(), Math.random().toString(36).substr(2,8));
    return request({url: url, saveToFile: tmpFile})
      .then(res => {
        if (is2xx(res)) return writeToS3(tmpFile, key);
        else throw new Error(`Server returns ${res.statusCode}`);
      })
      .then(() => fs.unlink(tmpFile, err => err && console.error(err)))
      .catch(err => {
        fs.unlink(tmpFile, err => err && console.error(err));
        throw err;
      })
  }
  function writeToS3(file, key) {
    return new Promise(function(fulfill, reject) {
      s3.putObject({
        Bucket: "etnow",
        Key: key,
        ACL: "public-read",
        Body: fs.createReadStream(file),
        CacheControl: "max-age=8640000,public"
      },
      function(err, data) {
        if (err) reject(err);
        else fulfill();
      })
    })
  }
}

function request(options) {
  var defaultOptions = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    },
    followRedirect: false,
    jar: true
  };
  options = Object.assign({}, defaultOptions, typeof options == "string" ? {url: options} : options);

  return new Promise(function(fulfill, reject) {
    var req = require("request")(options, function(err, res, body) {
      if (err) reject(err);
      else {
        res.body = body;
        fulfill(res);
      }
    })
    if (options.saveToFile) req.pipe(fs.createWriteStream(options.saveToFile));
  })
}

function is2xx(res) {
  return res.statusCode >= 200 && res.statusCode < 300;
}

function is3xx(res) {
  return res.statusCode >= 300 && res.statusCode < 400;
}

function isRedirectToLogin(res) {
  return is3xx(res) && /^\/login/.test(res.headers["location"]);
}
