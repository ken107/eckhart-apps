
var serviceUrl = "https://support.lsdsoftware.com";
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
		ajaxGet(serviceUrl + "/eckhart/list-videos/" + issues[issueIndex].id, function(result) {
			issues[issueIndex].videos = JSON.parse(result);
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
		ajaxGet(serviceUrl + "/eckhart/get-video/" + issues[issueIndex].videos[videoIndex].id, function(result) {
			issues[issueIndex].videos[videoIndex].url = JSON.parse(result);
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
	ajaxGet(serviceUrl + "/eckhart/list-issues", function(result) {
		issues = JSON.parse(result);
		issueIndex = 0;
	})
}

function ajaxGet(sUrl, fulfill, reject) {
	isLoading = true;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", sUrl, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			isLoading = false;
			if (xhr.status == 200) fulfill(xhr.responseText);
			else reject && reject(new Error(xhr.responseText));
		}
	};
	xhr.send(null);
}

function toggle(elem, visible) {
	elem.style.display = visible ? "" : "none";
}
