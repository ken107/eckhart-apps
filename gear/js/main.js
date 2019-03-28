
var serviceUrl = "https://service.lsdsoftware.com/eckhart-videos?capabilities=1.0";
var audio = new Audio();

state = "ISSUES";
issues = null;
issueIndex = null;
videoIndex = null;
isLoading = null;

function selectIssue() {
	if (issues[issueIndex].videos) {
		videoIndex = 0;
		state = "VIDEOS";
	}
	else {
		ajaxPost(serviceUrl, {
			method: "listVideos",
			issueId: issues[issueIndex].id
		},
		function(result) {
			issues[issueIndex].videos = result;
			videoIndex = 0;
			state = "VIDEOS";
		})
	}
}

function selectVideo() {
	if (issues[issueIndex].videos[videoIndex].url) {
		play();
	}
	else {
		ajaxPost(serviceUrl, {
			method: "getVideo",
			videoId: issues[issueIndex].videos[videoIndex].id
		},
		function(result) {
			issues[issueIndex].videos[videoIndex].url = result.replace(/^https:/, "http:");
			play();
		})
	}
	function play() {
		audio.src = issues[issueIndex].videos[videoIndex].url;
		audio.load();
		audio.play();
		state = "PLAYING";
	}
}

function pause() {
	audio.pause();
	state = "PAUSED";
}

function resume() {
	audio.play();
	state = "PLAYING";
}

function scroll(up) {
	switch (state) {
		case "ISSUES":
			if (up) issueIndex--;
			else issueIndex++;
			issueIndex = (issueIndex + issues.length) % issues.length;
			break;
		case "VIDEOS":
			if (up) videoIndex--;
			else videoIndex++;
			videoIndex = (videoIndex + issues[issueIndex].videos.length) % issues[issueIndex].videos.length;
			break;
	}
}

function goBack() {
	switch (state) {
		case "PLAYING":
		case "PAUSED":
			state = "VIDEOS";
			break;
		case "VIDEOS":
			state = "ISSUES";
			break;
		default:
			tizen.application.getCurrentApplication().exit();
	}
}

window.onload = function() {
	document.addEventListener("tizenhwkey", function(e) {
		if (e.keyName == "back") goBack();
	});
	document.addEventListener("rotarydetent", function(e) {
		scroll(e.detail.direction == 'CCW');
	});
	ajaxPost(serviceUrl, {
		method: "listIssues"
	},
	function(result) {
		issues = result;
		issueIndex = 0;
	})
}

function ajaxPost(url, data, fulfill) {
	isLoading = true;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				isLoading = false;
				fulfill(JSON.parse(xhr.responseText));
			}
			else console.error(xhr.responseText || xhr.statusText || xhr.status);
		}
	};
	xhr.send(JSON.stringify(data));
}

function toggle(elem, visible) {
	elem.style.display = visible ? "" : "none";
}
