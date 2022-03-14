const { writeFile, fstat } = require("fs-extra");
const playwright = require("playwright");

async function main() {
  const browser = await playwright.chromium.launch({
    // const browser = await playwright.firefox.launch({
    headless: true,
  });

  const page = await browser.newPage({});

  const ytTestURL1 = "https://www.youtube.com/c/corridorcrew/videos";
  const ytTestURL = "https://www.youtube.com/c/corridorcrew";
  const twTestURL = "https://twitter.com/ericvicenti";
  const twitchURL =
    "https://www.twitch.tv/ariathome/videos?filter=all&sort=time";
  const financeTestURL = "https://finance.yahoo.com/world-indices";
  await page.goto(twitchURL, { waitUntil: "networkidle" });

  await page.emulateMedia("screen");
  await new Promise((r) => setTimeout(r, 6_000));

  await page.setViewportSize({
    width: 1_600,
    height: 15_000,
  });

  // const pdf = await page.pdf({
  //   width: 1_600,
  //   height: 4_000,
  //   margin: {
  //     top: 0,
  //     right: 0,
  //     bottom: 0,
  //     left: 0,
  //   },
  // });

  page.on("console", async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });

  console.log("--");
  await page.evaluate(async () => {
    console.log("!!");

    for (let i = 0; i < document.body.scrollHeight; i += 250) {
      console.log("!=", i);

      await new Promise((resolve) =>
        setTimeout(resolve, 1_000 + Math.floor(Math.random() * 500))
      );
      window.scrollTo(0, i - 20 + Math.floor(Math.random() * 50));
    }
  });

  const results = await page.evaluate(() => {
    let vidContainers = document.querySelectorAll("article");

    let videoURLs = [];

    vidContainers.forEach((elem) => {
      videoURLs.push(elem.querySelector("a[href]").href);
    });

    return { count: vidContainers.length, videoURLs };
  });

  await writeFile("TwitchChannel.json", JSON.stringify(results, null, 2));
  await writeFile("TwitchChannelURLS.txt", results.videoURLs.join("\n"));

  // await writeFile("test.pdf", pdf);

  // const s = await page.screenshot({});
  // await writeFile("test.png", s);

  await browser.close();
}

main();
