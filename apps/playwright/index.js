const playwright = require("playwright");
async function main() {
  const browser = await playwright.chromium.launch({
    headless: false, // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  await page.goto("https://finance.yahoo.com/world-indices");
  await page.waitForTimeout(5000); // wait for 5 seconds
  await browser.close();
}

main();
