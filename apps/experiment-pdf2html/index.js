const pdf2html = require("pdf2html");

pdf2html.html("protocol.pdf", (err, html) => {
  if (err) {
    console.error("Conversion error: " + err);
  } else {
    console.log(html);
  }
});
