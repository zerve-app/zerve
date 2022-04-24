import { createEditor } from "lexical";

const editor = createEditor({
  onError: (e) => {
    console.error(e);
  },
});

alert("editor embed.");

const contentEditableElement = window.document.getElementById("editor");

editor.setRootElement(contentEditableElement);
