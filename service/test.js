const scrape = require("./scrape");

test("eckhart listIssues", async () => {
  const result = await scrape.listIssues();
  expect(result).toHaveProperty("0.id", expect.any(String));
})

test("eckhart listVideos", async () => {
  const result = await scrape.listVideos("DEC2015");
  expect(result).toHaveProperty("0.title", "Transcending Our Stories");
})

test("eckhart getVideo", async () => {
  const result = await scrape.getVideo("6fe69a59-4f02-44ad-acc0-9bb28b75c744");
  expect(result).toBe("https://s3.amazonaws.com/etnow/dec2015_060415qa01_hypocrite_128k.mp3");
})
