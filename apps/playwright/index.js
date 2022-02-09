const { writeFile } = require("fs-extra");
const playwright = require("playwright");

async function main() {
  // const browser = await playwright.chromium.launch({
  const browser = await playwright.firefox.launch({
    headless: true,
  });

  const page = await browser.newPage({});

  const ytTestURL1 = "https://www.youtube.com/c/corridorcrew/videos";
  const ytTestURL = "https://www.youtube.com/c/corridorcrew";
  const twTestURL = "https://twitter.com/ericvicenti";
  const financeTestURL = "https://finance.yahoo.com/world-indices";
  await page.goto(ytTestURL1, { waitUntil: "networkidle" });

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
  // await writeFile("test.pdf", pdf);

  const s = await page.screenshot({});
  await writeFile("test.png", s);

  await browser.close();
}

main();
