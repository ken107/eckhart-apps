
var express = require("express");
var app = express();
require("./index.js").mount(app)
app.listen(8080, () => console.log("Listening on 8080"));
