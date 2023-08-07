
const loginPromise = login(settings.email, settings.pass)

async function login(email, pass) {
	const res = await fetch("https://members.eckharttolle.com/wp-login.php", {
		method: "POST",
		headers: {"Content-Type":"application/x-www-form-urlencoded"},
		body: "log=" + encodeURIComponent(email) + "&pwd=" + encodeURIComponent(pass) + "&wp-submit=Log+In",
		credentials: "include"
	})
	if (!res.ok) throw new Error("Server returned " + res.status)
}



const getDOMParser = lazy(() => new DOMParser())
data = loadData() || {issuesForYear: {}, isComplete: false}
isUpdating = false
error = null

window.onload = async function() {
	try {
		isUpdating = true
		await updateData()
	}
	catch (err) {
		error = err
	}
	finally {
		isUpdating = false
	}
}

function loadData() {
	const item = localStorage.getItem("issues")
	if (item) return JSON.parse(item)
	else return null
}

async function updateData() {
	let page = 0
	let scraped = await scrapePage(page)
	outerLoop: while (scraped) {
		for (const year in scraped.issuesForYear) {
			if (!data.issuesForYear[year]) data.issuesForYear[year] = {issuesForMonth: {}}
			for (const month in scraped.issuesForYear[year].issuesForMonth) {
				if (data.isComplete && data.issuesForYear[year].issuesForMonth[month]) break outerLoop
				data.issuesForYear[year].issuesForMonth[month] = scraped.issuesForYear[year].issuesForMonth[month]
				console.info("Scraped data for", year, month)
			}
		}
		scraped = await scrapePage(++page)
	}
	if (!scraped) data.isComplete = true
	localStorage.setItem("issues", JSON.stringify(data))
}

async function scrapePage(page) {
	let url = "https://members.eckharttolle.com/prior-monthly-teachings/"
	if (page) url += "page/" + page + "/"
	await loginPromise
	const res = await fetch(url, {credentials: "include"})
	if (!res.ok) throw new Error("Server return " + res.status)
	const doc = getDOMParser().parseFromString(await res.text(), "text/html")
	let result
	const grid = doc.querySelector(".grid")
	if (grid) {
		let current
		for (const el of grid.children) {
			if (el.classList.contains("col-span-4")) {
				if (current) current.commit()
				const [month, year] = el.innerText.trim().split(/\s+/)
				current = {
					year,
					month,
					issues: [],
					commit() {
						if (!result) result = {issuesForYear: {}}
						if (!result.issuesForYear[this.year]) result.issuesForYear[this.year] = {issuesForMonth: {}}
						result.issuesForYear[this.year].issuesForMonth[this.month] = this.issues
					}
				}
			}
			else {
				current.issues.push({
					author: el.innerHTML.includes("kim_video_avatar") ? "kim" : "eckhart",
					title: el.innerText.trim(),
					link: el.querySelector("a").getAttribute("href")
				})
			}
		}
		if (current) current.commit()
	}
	return result
}



selectedYear = null

window.addEventListener("keydown", function(keyEvent) {
	if (keyEvent.code == "ArrowLeft") {
		const video = document.querySelector("video")
		if (video.classList.contains("active")) {
			keyEvent.preventDefault()
			const seekTime = video.currentTime - 10
			if (seekTime >= 0 && seekTime <= video.duration) video.currentTime = seekTime
		}
		else {
			keyEvent.preventDefault()
			const next = getSelectables()
				.filter(sel => sel.hDist < 0)
				.reduce((acc, sel) => acc && (acc.vDistAbs < sel.vDistAbs || acc.vDistAbs == sel.vDistAbs && acc.hDistAbs < sel.hDistAbs) ? acc : sel, null)
			if (next) setSelected(next.el)
		}
	}
	else if (keyEvent.code == "ArrowRight") {
		const video = document.querySelector("video")
		if (video.classList.contains("active")) {
			keyEvent.preventDefault()
			const seekTime = video.currentTime + 10
			if (seekTime >= 0 && seekTime <= video.duration) video.currentTime = seekTime
		}
		else {
			keyEvent.preventDefault()
			const next = getSelectables()
				.filter(sel => sel.hDist > 0)
				.reduce((acc, sel) => acc && (acc.vDistAbs < sel.vDistAbs || acc.vDistAbs == sel.vDistAbs && acc.hDistAbs < sel.hDistAbs) ? acc : sel, null)
			if (next) setSelected(next.el)
		}
	}
	else if (keyEvent.code == "ArrowUp") {
		keyEvent.preventDefault()
		const next = getSelectables()
			.filter(sel => sel.vDist < 0)
			.reduce((acc, sel) => acc && (acc.hDistAbs < sel.hDistAbs || acc.hDistAbs == sel.hDistAbs && acc.vDistAbs < sel.vDistAbs) ? acc : sel, null)
		if (next) setSelected(next.el)
	}
	else if (keyEvent.code == "ArrowDown") {
		keyEvent.preventDefault()
		const next = getSelectables()
			.filter(sel => sel.vDist > 0)
			.reduce((acc, sel) => acc && (acc.hDistAbs < sel.hDistAbs || acc.hDistAbs == sel.hDistAbs && acc.vDistAbs < sel.vDistAbs) ? acc : sel, null)
		if (next) setSelected(next.el)
	}
	else if (keyEvent.code == "Enter") {
		const video = document.querySelector("video")
		if (video.classList.contains("active")) {
			keyEvent.preventDefault()
			if (video.paused) video.play()
			else video.pause()
		}
		else {
			keyEvent.preventDefault()
			const selectedEl = document.querySelector(".selected")
			if (selectedEl) selectedEl.dispatchEvent(new Event("click"))
		}
	}
	else if (keyEvent.code == "Escape") {
		const video = document.querySelector("video")
		if (video.classList.contains("active")) {
			keyEvent.preventDefault()
			video.pause()
			video.classList.remove("active")
		}
		else if (selectedYear) {
			keyEvent.preventDefault()
			selectedYear = null
		}
	}
})

function getSelectables() {
	const selectedEl = document.querySelector(".selected")
	const selectableEls = Array.from(document.querySelectorAll(".selectable:not(.hidden):not(.selected)"))
	if (selectedEl) {
		const selectedBounds = selectedEl.getBoundingClientRect()
		return selectableEls
			.map(el => {
				const bounds = el.getBoundingClientRect()
				const hDist = bounds.x - selectedBounds.x
				const vDist = bounds.y - selectedBounds.y
				return {el, hDist, vDist, hDistAbs:Math.abs(hDist), vDistAbs:Math.abs(vDist)}
			})
	}
	else {
		return selectableEls.slice(0,1)
			.map(el => {
				return {el, hDist:1, vDist:1, hDistAbs:1, vDistAbs:1}
			})
	}
}

function setSelected(el) {
	for (const selectedEl of document.querySelectorAll(".selected")) selectedEl.classList.remove("selected")
	el.classList.add("selected")
	el.scrollIntoViewIfNeeded(false)
}

async function playIssue(issue) {
	try {
		const video = document.querySelector("video")
		video.src = await getVideoUrl(issue.link)
		video.load()
		video.classList.add("active")
		await video.play()
	}
	catch (err) {
		error = err
	}
}

async function getVideoUrl(issueLink) {
	await loginPromise
	const res = await fetch(issueLink, {credentials: "include"})
	if (!res.ok) throw new Error("Server return " + res.status)
	const doc = getDOMParser().parseFromString(await res.text(), "text/html")
	return doc.querySelector("video source").src
}



function lazy(get) {
	let val
	return () => val || (val = get())
}
