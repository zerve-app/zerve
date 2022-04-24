(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

  // ../../node_modules/lexical/Lexical.dev.js
  var require_Lexical_dev = __commonJS({
    "../../node_modules/lexical/Lexical.dev.js"(exports) {
      "use strict";
      var getSelection = () => window.getSelection();
      var getDOMSelection = getSelection;
      var DOM_ELEMENT_TYPE = 1;
      var DOM_TEXT_TYPE = 3;
      var NO_DIRTY_NODES = 0;
      var HAS_DIRTY_NODES = 1;
      var FULL_RECONCILE = 2;
      var IS_NORMAL = 0;
      var IS_TOKEN = 1;
      var IS_SEGMENTED = 2;
      var IS_INERT = 3;
      var IS_BOLD = 1;
      var IS_ITALIC = 1 << 1;
      var IS_STRIKETHROUGH = 1 << 2;
      var IS_UNDERLINE = 1 << 3;
      var IS_CODE = 1 << 4;
      var IS_SUBSCRIPT = 1 << 5;
      var IS_SUPERSCRIPT = 1 << 6;
      var IS_DIRECTIONLESS = 1;
      var IS_UNMERGEABLE = 1 << 1;
      var IS_ALIGN_LEFT = 1;
      var IS_ALIGN_CENTER = 2;
      var IS_ALIGN_RIGHT = 3;
      var IS_ALIGN_JUSTIFY = 4;
      var ZERO_WIDTH_CHAR = "\u200B";
      var RTL = "\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC";
      var LTR = "A-Za-z\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF";
      var RTL_REGEX = new RegExp("^[^" + LTR + "]*[" + RTL + "]");
      var LTR_REGEX = new RegExp("^[^" + RTL + "]*[" + LTR + "]");
      var TEXT_TYPE_TO_FORMAT = {
        bold: IS_BOLD,
        code: IS_CODE,
        italic: IS_ITALIC,
        strikethrough: IS_STRIKETHROUGH,
        subscript: IS_SUBSCRIPT,
        superscript: IS_SUPERSCRIPT,
        underline: IS_UNDERLINE
      };
      var ELEMENT_TYPE_TO_FORMAT = {
        center: IS_ALIGN_CENTER,
        justify: IS_ALIGN_JUSTIFY,
        left: IS_ALIGN_LEFT,
        right: IS_ALIGN_RIGHT
      };
      var TEXT_MODE_TO_TYPE = {
        inert: IS_INERT,
        normal: IS_NORMAL,
        segmented: IS_SEGMENTED,
        token: IS_TOKEN
      };
      var CAN_USE_DOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
      var documentMode = CAN_USE_DOM && "documentMode" in document ? document.documentMode : null;
      var IS_APPLE = CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      var IS_FIREFOX = CAN_USE_DOM && /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);
      var CAN_USE_BEFORE_INPUT = CAN_USE_DOM && "InputEvent" in window && !documentMode ? "getTargetRanges" in new window.InputEvent("input") : false;
      var IS_SAFARI = CAN_USE_DOM && /Version\/[\d\.]+.*Safari/.test(navigator.userAgent);
      var IS_IOS = CAN_USE_DOM && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      var keyCounter = 0;
      function generateRandomKey() {
        return "" + keyCounter++;
      }
      function getRegisteredNodeOrThrow(editor2, nodeType) {
        const registeredNode = editor2._nodes.get(nodeType);
        if (registeredNode === void 0) {
          {
            throw Error(`registeredNode: Type ${nodeType} not found`);
          }
        }
        return registeredNode;
      }
      var scheduleMicroTask = typeof queueMicrotask === "function" ? queueMicrotask : (fn) => {
        Promise.resolve().then(fn);
      };
      function isSelectionCapturedInDecoratorInput(anchorDOM) {
        const activeElement = document.activeElement;
        const nodeName = activeElement !== null ? activeElement.nodeName : null;
        return !$isDecoratorNode($getNearestNodeFromDOMNode(anchorDOM)) || nodeName !== "INPUT" && nodeName !== "TEXTAREA";
      }
      function isSelectionWithinEditor(editor2, anchorDOM, focusDOM) {
        const rootElement = editor2.getRootElement();
        try {
          return rootElement !== null && rootElement.contains(anchorDOM) && rootElement.contains(focusDOM) && anchorDOM !== null && isSelectionCapturedInDecoratorInput(anchorDOM) && getNearestEditorFromDOMNode(anchorDOM) === editor2;
        } catch (error) {
          return false;
        }
      }
      function getNearestEditorFromDOMNode(node) {
        let currentNode = node;
        while (currentNode != null) {
          const editor2 = currentNode.__lexicalEditor;
          if (editor2 != null && !editor2.isReadOnly()) {
            return editor2;
          }
          currentNode = currentNode.parentNode;
        }
        return null;
      }
      function getTextDirection(text) {
        if (RTL_REGEX.test(text)) {
          return "rtl";
        }
        if (LTR_REGEX.test(text)) {
          return "ltr";
        }
        return null;
      }
      function $isTokenOrInert(node) {
        return node.isToken() || node.isInert();
      }
      function getDOMTextNode(element) {
        let node = element;
        while (node != null) {
          if (node.nodeType === DOM_TEXT_TYPE) {
            return node;
          }
          node = node.firstChild;
        }
        return null;
      }
      function toggleTextFormatType(format, type, alignWithFormat) {
        const activeFormat = TEXT_TYPE_TO_FORMAT[type];
        const isStateFlagPresent = format & activeFormat;
        if (isStateFlagPresent && (alignWithFormat === null || (alignWithFormat & activeFormat) === 0)) {
          return format ^ activeFormat;
        }
        if (alignWithFormat === null || alignWithFormat & activeFormat) {
          return format | activeFormat;
        }
        return format;
      }
      function $isLeafNode(node) {
        return $isTextNode(node) || $isLineBreakNode(node) || $isDecoratorNode(node);
      }
      function $setNodeKey(node, existingKey) {
        if (existingKey != null) {
          node.__key = existingKey;
          return;
        }
        errorOnReadOnly();
        errorOnInfiniteTransforms();
        const editor2 = getActiveEditor();
        const editorState = getActiveEditorState();
        const key = generateRandomKey();
        editorState._nodeMap.set(key, node);
        if ($isElementNode(node)) {
          editor2._dirtyElements.set(key, true);
        } else {
          editor2._dirtyLeaves.add(key);
        }
        editor2._cloneNotNeeded.add(key);
        editor2._dirtyType = HAS_DIRTY_NODES;
        node.__key = key;
      }
      function internalMarkParentElementsAsDirty(parentKey, nodeMap, dirtyElements) {
        let nextParentKey = parentKey;
        while (nextParentKey !== null) {
          if (dirtyElements.has(nextParentKey)) {
            return;
          }
          const node = nodeMap.get(nextParentKey);
          if (node === void 0) {
            break;
          }
          dirtyElements.set(nextParentKey, false);
          nextParentKey = node.__parent;
        }
      }
      function removeFromParent(writableNode) {
        const oldParent = writableNode.getParent();
        if (oldParent !== null) {
          const writableParent = oldParent.getWritable();
          const children = writableParent.__children;
          const index = children.indexOf(writableNode.__key);
          if (index === -1) {
            {
              throw Error(`Node is not a child of its parent`);
            }
          }
          internalMarkSiblingsAsDirty(writableNode);
          children.splice(index, 1);
        }
      }
      function internalMarkNodeAsDirty(node) {
        errorOnInfiniteTransforms();
        const latest = node.getLatest();
        const parent = latest.__parent;
        const editorState = getActiveEditorState();
        const editor2 = getActiveEditor();
        const nodeMap = editorState._nodeMap;
        const dirtyElements = editor2._dirtyElements;
        if (parent !== null) {
          internalMarkParentElementsAsDirty(parent, nodeMap, dirtyElements);
        }
        const key = latest.__key;
        editor2._dirtyType = HAS_DIRTY_NODES;
        if ($isElementNode(node)) {
          dirtyElements.set(key, true);
        } else {
          editor2._dirtyLeaves.add(key);
        }
      }
      function internalMarkSiblingsAsDirty(node) {
        const previousNode = node.getPreviousSibling();
        const nextNode = node.getNextSibling();
        if (previousNode !== null) {
          internalMarkNodeAsDirty(previousNode);
        }
        if (nextNode !== null) {
          internalMarkNodeAsDirty(nextNode);
        }
      }
      function $setCompositionKey(compositionKey) {
        errorOnReadOnly();
        const editor2 = getActiveEditor();
        const previousCompositionKey = editor2._compositionKey;
        editor2._compositionKey = compositionKey;
        if (previousCompositionKey !== null) {
          const node = $getNodeByKey(previousCompositionKey);
          if (node !== null) {
            node.getWritable();
          }
        }
        if (compositionKey !== null) {
          const node = $getNodeByKey(compositionKey);
          if (node !== null) {
            node.getWritable();
          }
        }
      }
      function $getCompositionKey() {
        const editor2 = getActiveEditor();
        return editor2._compositionKey;
      }
      function $getNodeByKey(key, _editorState) {
        const editorState = _editorState || getActiveEditorState();
        const node = editorState._nodeMap.get(key);
        if (node === void 0) {
          return null;
        }
        return node;
      }
      function getNodeFromDOMNode(dom, editorState) {
        const editor2 = getActiveEditor();
        const key = dom["__lexicalKey_" + editor2._key];
        if (key !== void 0) {
          return $getNodeByKey(key, editorState);
        }
        return null;
      }
      function $getNearestNodeFromDOMNode(startingDOM, editorState) {
        let dom = startingDOM;
        while (dom != null) {
          const node = getNodeFromDOMNode(dom, editorState);
          if (node !== null) {
            return node;
          }
          dom = dom.parentNode;
        }
        return null;
      }
      function cloneDecorators(editor2) {
        const currentDecorators = editor2._decorators;
        const pendingDecorators = Object.assign({}, currentDecorators);
        editor2._pendingDecorators = pendingDecorators;
        return pendingDecorators;
      }
      function getEditorStateTextContent(editorState) {
        return editorState.read((view) => $getRoot().getTextContent());
      }
      function markAllNodesAsDirty(editor2, type) {
        updateEditor(editor2, () => {
          const editorState = getActiveEditorState();
          if (editorState.isEmpty()) {
            return;
          }
          if (type === "root") {
            $getRoot().markDirty();
            return;
          }
          const nodeMap = editorState._nodeMap;
          for (const [, node] of nodeMap) {
            node.markDirty();
          }
        }, editor2._pendingEditorState === null ? {
          tag: "history-merge"
        } : void 0);
      }
      function $getRoot() {
        return internalGetRoot(getActiveEditorState());
      }
      function internalGetRoot(editorState) {
        return editorState._nodeMap.get("root");
      }
      function $setSelection(selection) {
        const editorState = getActiveEditorState();
        if (selection !== null && Object.isFrozen(selection)) {
          console.warn("$setSelection called on frozen selection object. Ensure selection is cloned before passing in.");
        }
        editorState._selection = selection;
      }
      function $flushMutations$1() {
        errorOnReadOnly();
        const editor2 = getActiveEditor();
        flushRootMutations(editor2);
      }
      function getNodeFromDOM(dom) {
        const editor2 = getActiveEditor();
        const nodeKey = getNodeKeyFromDOM(dom, editor2);
        if (nodeKey === null) {
          const rootElement = editor2.getRootElement();
          if (dom === rootElement) {
            return $getNodeByKey("root");
          }
          return null;
        }
        return $getNodeByKey(nodeKey);
      }
      function getTextNodeOffset(node, moveSelectionToEnd) {
        return moveSelectionToEnd ? node.getTextContentSize() : 0;
      }
      function getNodeKeyFromDOM(dom, editor2) {
        let node = dom;
        while (node != null) {
          const key = node["__lexicalKey_" + editor2._key];
          if (key !== void 0) {
            return key;
          }
          node = node.parentNode;
        }
        return null;
      }
      function doesContainGrapheme(str) {
        return /[\uD800-\uDBFF][\uDC00-\uDFFF]/g.test(str);
      }
      function getEditorsToPropagate(editor2) {
        const editorsToPropagate = [];
        let currentEditor = editor2;
        while (currentEditor !== null) {
          editorsToPropagate.push(currentEditor);
          currentEditor = currentEditor._parentEditor;
        }
        return editorsToPropagate;
      }
      function createUID() {
        return Math.random().toString(36).replace(/[^a-z]+/g, "").substr(0, 5);
      }
      function $updateSelectedTextFromDOM(editor2, compositionEndEvent) {
        const domSelection = getDOMSelection();
        if (domSelection === null) {
          return;
        }
        const anchorNode = domSelection.anchorNode;
        let {
          anchorOffset,
          focusOffset
        } = domSelection;
        if (anchorNode !== null && anchorNode.nodeType === DOM_TEXT_TYPE) {
          const node = $getNearestNodeFromDOMNode(anchorNode);
          if ($isTextNode(node)) {
            let textContent = anchorNode.nodeValue;
            const data = compositionEndEvent !== null && compositionEndEvent.data;
            if (textContent === ZERO_WIDTH_CHAR && data) {
              const offset = data.length;
              textContent = data;
              anchorOffset = offset;
              focusOffset = offset;
            }
            $updateTextNodeFromDOMContent(node, textContent, anchorOffset, focusOffset, compositionEndEvent !== null);
          }
        }
      }
      function $updateTextNodeFromDOMContent(textNode, textContent, anchorOffset, focusOffset, compositionEnd) {
        let node = textNode;
        if (node.isAttached() && (compositionEnd || !node.isDirty())) {
          const isComposing = node.isComposing();
          let normalizedTextContent = textContent;
          if ((isComposing || compositionEnd) && textContent[textContent.length - 1] === ZERO_WIDTH_CHAR) {
            normalizedTextContent = textContent.slice(0, -1);
          }
          const prevTextContent = node.getTextContent();
          if (compositionEnd || normalizedTextContent !== prevTextContent) {
            if (normalizedTextContent === "") {
              $setCompositionKey(null);
              if (!IS_SAFARI && !IS_IOS) {
                const editor2 = getActiveEditor();
                setTimeout(() => {
                  editor2.update(() => {
                    node.remove();
                  });
                }, 20);
              } else {
                node.remove();
              }
              return;
            }
            const parent = node.getParent();
            const prevSelection = $getPreviousSelection();
            if ($isTokenOrInert(node) || $getCompositionKey() !== null && !isComposing || parent !== null && $isRangeSelection(prevSelection) && !parent.canInsertTextBefore() && prevSelection.anchor.offset === 0) {
              node.markDirty();
              return;
            }
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || anchorOffset === null || focusOffset === null) {
              node.setTextContent(normalizedTextContent);
              return;
            }
            selection.setTextNodeRange(node, anchorOffset, node, focusOffset);
            if (node.isSegmented()) {
              const originalTextContent = node.getTextContent();
              const replacement = $createTextNode(originalTextContent);
              node.replace(replacement);
              node = replacement;
            }
            node.setTextContent(normalizedTextContent);
          }
        }
      }
      function $shouldInsertTextAfterOrBeforeTextNode(selection, node) {
        if (node.isSegmented()) {
          return true;
        }
        if (!selection.isCollapsed()) {
          return false;
        }
        const offset = selection.anchor.offset;
        const parent = node.getParentOrThrow();
        const isToken = node.isToken();
        const shouldInsertTextBefore = offset === 0 && (!node.canInsertTextBefore() || !parent.canInsertTextBefore() || isToken);
        const shouldInsertTextAfter = node.getTextContentSize() === offset && (!node.canInsertTextBefore() || !parent.canInsertTextBefore() || isToken);
        return shouldInsertTextBefore || shouldInsertTextAfter;
      }
      function $shouldPreventDefaultAndInsertText(selection, text, isBeforeInput) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const anchorNode = anchor.getNode();
        const domSelection = getDOMSelection();
        const domAnchorNode = domSelection !== null ? domSelection.anchorNode : null;
        const anchorKey = anchor.key;
        const backingAnchorElement = getActiveEditor().getElementByKey(anchorKey);
        return anchorKey !== focus.key || !$isTextNode(anchorNode) || anchor.offset !== focus.offset && !anchorNode.isComposing() || (isBeforeInput || anchorNode.isDirty()) && text.length > 1 || backingAnchorElement !== null && !anchorNode.isComposing() && domAnchorNode !== getDOMTextNode(backingAnchorElement) || anchorNode.getFormat() !== selection.format || $shouldInsertTextAfterOrBeforeTextNode(selection, anchorNode);
      }
      function isTab(keyCode, altKey, ctrlKey, metaKey) {
        return keyCode === 9 && !altKey && !ctrlKey && !metaKey;
      }
      function isBold(keyCode, metaKey, ctrlKey) {
        return keyCode === 66 && controlOrMeta(metaKey, ctrlKey);
      }
      function isItalic(keyCode, metaKey, ctrlKey) {
        return keyCode === 73 && controlOrMeta(metaKey, ctrlKey);
      }
      function isUnderline(keyCode, metaKey, ctrlKey) {
        return keyCode === 85 && controlOrMeta(metaKey, ctrlKey);
      }
      function isParagraph(keyCode, shiftKey) {
        return isReturn(keyCode) && !shiftKey;
      }
      function isLineBreak(keyCode, shiftKey) {
        return isReturn(keyCode) && shiftKey;
      }
      function isOpenLineBreak(keyCode, ctrlKey) {
        return IS_APPLE && ctrlKey && keyCode === 79;
      }
      function isDeleteWordBackward(keyCode, altKey, ctrlKey) {
        return isBackspace(keyCode) && (IS_APPLE ? altKey : ctrlKey);
      }
      function isDeleteWordForward(keyCode, altKey, ctrlKey) {
        return isDelete(keyCode) && (IS_APPLE ? altKey : ctrlKey);
      }
      function isDeleteLineBackward(keyCode, metaKey) {
        return IS_APPLE && metaKey && isBackspace(keyCode);
      }
      function isDeleteLineForward(keyCode, metaKey) {
        return IS_APPLE && metaKey && isDelete(keyCode);
      }
      function isDeleteBackward(keyCode, altKey, metaKey, ctrlKey) {
        if (IS_APPLE) {
          if (altKey || metaKey) {
            return false;
          }
          return isBackspace(keyCode) || keyCode === 72 && ctrlKey;
        }
        if (ctrlKey || altKey || metaKey) {
          return false;
        }
        return isBackspace(keyCode);
      }
      function isDeleteForward(keyCode, ctrlKey, shiftKey, altKey, metaKey) {
        if (IS_APPLE) {
          if (shiftKey || altKey || metaKey) {
            return false;
          }
          return isDelete(keyCode) || keyCode === 68 && ctrlKey;
        }
        if (ctrlKey || altKey || metaKey) {
          return false;
        }
        return isDelete(keyCode);
      }
      function isUndo(keyCode, shiftKey, metaKey, ctrlKey) {
        return keyCode === 90 && !shiftKey && controlOrMeta(metaKey, ctrlKey);
      }
      function isRedo(keyCode, shiftKey, metaKey, ctrlKey) {
        if (IS_APPLE) {
          return keyCode === 90 && metaKey && shiftKey;
        }
        return keyCode === 89 && ctrlKey || keyCode === 90 && ctrlKey && shiftKey;
      }
      function isArrowLeft(keyCode) {
        return keyCode === 37;
      }
      function isArrowRight(keyCode) {
        return keyCode === 39;
      }
      function isArrowUp(keyCode) {
        return keyCode === 38;
      }
      function isArrowDown(keyCode) {
        return keyCode === 40;
      }
      function isMoveBackward(keyCode, ctrlKey, shiftKey, altKey, metaKey) {
        return isArrowLeft(keyCode) && !ctrlKey && !metaKey && !altKey;
      }
      function isMoveForward(keyCode, ctrlKey, shiftKey, altKey, metaKey) {
        return isArrowRight(keyCode) && !ctrlKey && !metaKey && !altKey;
      }
      function isMoveUp(keyCode, ctrlKey, shiftKey, altKey, metaKey) {
        return isArrowUp(keyCode) && !ctrlKey && !metaKey;
      }
      function isMoveDown(keyCode, ctrlKey, shiftKey, altKey, metaKey) {
        return isArrowDown(keyCode) && !ctrlKey && !metaKey;
      }
      function controlOrMeta(metaKey, ctrlKey) {
        if (IS_APPLE) {
          return metaKey;
        }
        return ctrlKey;
      }
      function isReturn(keyCode) {
        return keyCode === 13;
      }
      function isBackspace(keyCode) {
        return keyCode === 8;
      }
      function isEscape(keyCode) {
        return keyCode === 27;
      }
      function isDelete(keyCode) {
        return keyCode === 46;
      }
      function getCachedClassNameArray(classNamesTheme, classNameThemeType) {
        const classNames = classNamesTheme[classNameThemeType];
        if (typeof classNames === "string") {
          const classNamesArr = classNames.split(" ");
          classNamesTheme[classNameThemeType] = classNamesArr;
          return classNamesArr;
        }
        return classNames;
      }
      function setMutatedNode(mutatedNodes2, registeredNodes, mutationListeners, node, mutation) {
        if (mutationListeners.size === 0) {
          return;
        }
        const nodeType = node.__type;
        const nodeKey = node.__key;
        const registeredNode = registeredNodes.get(nodeType);
        if (registeredNode === void 0) {
          {
            throw Error(`Type ${nodeType} not in registeredNodes`);
          }
        }
        const klass = registeredNode.klass;
        let mutatedNodesByType = mutatedNodes2.get(klass);
        if (mutatedNodesByType === void 0) {
          mutatedNodesByType = /* @__PURE__ */ new Map();
          mutatedNodes2.set(klass, mutatedNodesByType);
        }
        if (!mutatedNodesByType.has(nodeKey)) {
          mutatedNodesByType.set(nodeKey, mutation);
        }
      }
      function $nodesOfType(klass) {
        const editorState = getActiveEditorState();
        const readOnly = editorState._readOnly;
        const klassType = klass.getType();
        const nodes = editorState._nodeMap;
        const nodesOfType = [];
        for (const [, node] of nodes) {
          if (node instanceof klass && node.__type === klassType && (readOnly || node.isAttached())) {
            nodesOfType.push(node);
          }
        }
        return nodesOfType;
      }
      function resolveElement(element, isBackward, focusOffset) {
        const parent = element.getParent();
        let offset = focusOffset;
        let block = element;
        if (parent !== null) {
          if (isBackward && focusOffset === 0) {
            offset = block.getIndexWithinParent();
            block = parent;
          } else if (!isBackward && focusOffset === block.getChildrenSize()) {
            offset = block.getIndexWithinParent() + 1;
            block = parent;
          }
        }
        return block.getChildAtIndex(isBackward ? offset - 1 : offset);
      }
      function $getDecoratorNode(focus, isBackward) {
        const focusOffset = focus.offset;
        if (focus.type === "element") {
          const block = focus.getNode();
          return resolveElement(block, isBackward, focusOffset);
        } else {
          const focusNode = focus.getNode();
          if (isBackward && focusOffset === 0 || !isBackward && focusOffset === focusNode.getTextContentSize()) {
            const possibleNode = isBackward ? focusNode.getPreviousSibling() : focusNode.getNextSibling();
            if (possibleNode === null) {
              return resolveElement(focusNode.getParentOrThrow(), isBackward, focusNode.getIndexWithinParent() + (isBackward ? 0 : 1));
            }
            return possibleNode;
          }
        }
        return null;
      }
      function isFirefoxClipboardEvents() {
        const event = window.event;
        const inputType = event && event.inputType;
        return inputType === "insertFromPaste" || inputType === "insertFromPasteAsQuotation";
      }
      function dispatchCommand(editor2, type, payload) {
        return triggerCommandListeners(editor2, type, payload);
      }
      function $garbageCollectDetachedDecorators(editor2, pendingEditorState) {
        const currentDecorators = editor2._decorators;
        const pendingDecorators = editor2._pendingDecorators;
        let decorators = pendingDecorators || currentDecorators;
        const nodeMap = pendingEditorState._nodeMap;
        let key;
        for (key in decorators) {
          if (!nodeMap.has(key)) {
            if (decorators === currentDecorators) {
              decorators = cloneDecorators(editor2);
            }
            delete decorators[key];
          }
        }
      }
      function $garbageCollectDetachedDeepChildNodes(node, parentKey, prevNodeMap, nodeMap, dirtyNodes) {
        const children = node.__children;
        const childrenLength = children.length;
        for (let i = 0; i < childrenLength; i++) {
          const childKey = children[i];
          const child = nodeMap.get(childKey);
          if (child !== void 0 && child.__parent === parentKey) {
            if ($isElementNode(child)) {
              $garbageCollectDetachedDeepChildNodes(child, childKey, prevNodeMap, nodeMap, dirtyNodes);
            }
            if (!prevNodeMap.has(childKey)) {
              dirtyNodes.delete(childKey);
            }
            nodeMap.delete(childKey);
          }
        }
      }
      function $garbageCollectDetachedNodes(prevEditorState, editorState, dirtyLeaves, dirtyElements) {
        const prevNodeMap = prevEditorState._nodeMap;
        const nodeMap = editorState._nodeMap;
        for (const nodeKey of dirtyLeaves) {
          const node = nodeMap.get(nodeKey);
          if (node !== void 0 && !node.isAttached()) {
            if (!prevNodeMap.has(nodeKey)) {
              dirtyLeaves.delete(nodeKey);
            }
            nodeMap.delete(nodeKey);
          }
        }
        for (const [nodeKey] of dirtyElements) {
          const node = nodeMap.get(nodeKey);
          if (node !== void 0) {
            if (!node.isAttached()) {
              if ($isElementNode(node)) {
                $garbageCollectDetachedDeepChildNodes(node, nodeKey, prevNodeMap, nodeMap, dirtyElements);
              }
              if (!prevNodeMap.has(nodeKey)) {
                dirtyElements.delete(nodeKey);
              }
              nodeMap.delete(nodeKey);
            }
          }
        }
      }
      function $canSimpleTextNodesBeMerged(node1, node2) {
        const node1Mode = node1.__mode;
        const node1Format = node1.__format;
        const node1Style = node1.__style;
        const node2Mode = node2.__mode;
        const node2Format = node2.__format;
        const node2Style = node2.__style;
        return (node1Mode === null || node1Mode === node2Mode) && (node1Format === null || node1Format === node2Format) && (node1Style === null || node1Style === node2Style);
      }
      function $mergeTextNodes(node1, node2) {
        const writableNode1 = node1.mergeWithSibling(node2);
        const normalizedNodes = getActiveEditor()._normalizedNodes;
        normalizedNodes.add(node1.__key);
        normalizedNodes.add(node2.__key);
        return writableNode1;
      }
      function $normalizeTextNode(textNode) {
        let node = textNode;
        if (node.__text === "" && node.isSimpleText() && !node.isUnmergeable()) {
          node.remove();
          return;
        }
        let previousNode;
        while ((previousNode = node.getPreviousSibling()) !== null && $isTextNode(previousNode) && previousNode.isSimpleText() && !previousNode.isUnmergeable()) {
          if (previousNode.__text === "") {
            previousNode.remove();
          } else if ($canSimpleTextNodesBeMerged(previousNode, node)) {
            node = $mergeTextNodes(previousNode, node);
            break;
          } else {
            break;
          }
        }
        let nextNode;
        while ((nextNode = node.getNextSibling()) !== null && $isTextNode(nextNode) && nextNode.isSimpleText() && !nextNode.isUnmergeable()) {
          if (nextNode.__text === "") {
            nextNode.remove();
          } else if ($canSimpleTextNodesBeMerged(node, nextNode)) {
            node = $mergeTextNodes(node, nextNode);
            break;
          } else {
            break;
          }
        }
      }
      function $createNodeFromParse(parsedNode, parsedNodeMap) {
        errorOnReadOnly();
        const editor2 = getActiveEditor();
        return internalCreateNodeFromParse(parsedNode, parsedNodeMap, editor2, null);
      }
      function internalCreateNodeFromParse(parsedNode, parsedNodeMap, editor2, parentKey, state = {
        originalSelection: null
      }) {
        const nodeType = parsedNode.__type;
        const registeredNode = editor2._nodes.get(nodeType);
        if (registeredNode === void 0) {
          {
            throw Error(`createNodeFromParse: type "${nodeType}" + not found`);
          }
        }
        for (const property in parsedNode) {
          const value = parsedNode[property];
          if (value != null && typeof value === "object") {
            const parsedEditorState = value.editorState;
            if (parsedEditorState != null) {
              const nestedEditor = createEditor2();
              nestedEditor._nodes = editor2._nodes;
              nestedEditor._parentEditor = editor2._parentEditor;
              nestedEditor._pendingEditorState = parseEditorState(parsedEditorState, nestedEditor);
              parsedNode[property] = nestedEditor;
            }
          }
        }
        const NodeKlass = registeredNode.klass;
        const parsedKey = parsedNode.__key;
        parsedNode.__key = void 0;
        const node = NodeKlass.clone(parsedNode);
        parsedNode.__key = parsedKey;
        const key = node.__key;
        if ($isRootNode(node)) {
          const editorState = getActiveEditorState();
          editorState._nodeMap.set("root", node);
        }
        node.__parent = parentKey;
        if ($isElementNode(node)) {
          const children = parsedNode.__children;
          for (let i = 0; i < children.length; i++) {
            const childKey = children[i];
            const parsedChild = parsedNodeMap.get(childKey);
            if (parsedChild !== void 0) {
              const child = internalCreateNodeFromParse(parsedChild, parsedNodeMap, editor2, key, state);
              const newChildKey = child.__key;
              node.__children.push(newChildKey);
            }
          }
          node.__indent = parsedNode.__indent;
          node.__format = parsedNode.__format;
          node.__dir = parsedNode.__dir;
        } else if ($isTextNode(node)) {
          node.__format = parsedNode.__format;
          node.__style = parsedNode.__style;
          node.__mode = parsedNode.__mode;
          node.__detail = parsedNode.__detail;
        }
        const originalSelection = state != null ? state.originalSelection : void 0;
        if (originalSelection != null) {
          let remappedSelection = state.remappedSelection;
          if (originalSelection.type === "range") {
            const anchor = originalSelection.anchor;
            const focus = originalSelection.focus;
            if (remappedSelection == null && (parsedKey === anchor.key || parsedKey === focus.key)) {
              state.remappedSelection = remappedSelection = {
                anchor: __spreadValues({}, anchor),
                focus: __spreadValues({}, focus),
                type: "range"
              };
            }
            if (remappedSelection != null && remappedSelection.type === "range") {
              if (parsedKey === anchor.key) {
                remappedSelection.anchor.key = key;
              }
              if (parsedKey === focus.key) {
                remappedSelection.focus.key = key;
              }
            }
          } else if (originalSelection.type === "node") {
            const nodes = originalSelection.nodes;
            const indexOf = nodes.indexOf(parsedKey);
            if (indexOf !== -1) {
              if (remappedSelection == null) {
                state.remappedSelection = remappedSelection = {
                  nodes: [...nodes],
                  type: "node"
                };
              }
              if (remappedSelection.type === "node") {
                remappedSelection.nodes.splice(indexOf, 1, key);
              }
            }
          } else if (originalSelection.type === "grid") {
            const gridKey = originalSelection.gridKey;
            const anchorCellKey = originalSelection.anchorCellKey;
            const focusCellKey = originalSelection.focusCellKey;
            if (remappedSelection == null && (gridKey === parsedKey || gridKey === anchorCellKey || gridKey === focusCellKey)) {
              state.remappedSelection = remappedSelection = __spreadProps(__spreadValues({}, originalSelection), {
                type: "grid"
              });
            }
            if (remappedSelection != null && remappedSelection.type === "grid") {
              if (gridKey === parsedKey) {
                remappedSelection.gridKey = key;
              }
              if (anchorCellKey === parsedKey) {
                remappedSelection.anchorCellKey = key;
              }
              if (focusCellKey === parsedKey) {
                remappedSelection.focusCellKey = key;
              }
            }
          }
        }
        return node;
      }
      var subTreeTextContent = "";
      var subTreeDirectionedTextContent = "";
      var editorTextContent = "";
      var activeEditorConfig;
      var activeEditor$1;
      var activeEditorNodes;
      var treatAllNodesAsDirty = false;
      var activeEditorStateReadOnly = false;
      var activeMutationListeners;
      var activeTextDirection = null;
      var activeDirtyElements;
      var activeDirtyLeaves;
      var activePrevNodeMap;
      var activeNextNodeMap;
      var activePrevKeyToDOMMap;
      var mutatedNodes;
      function destroyNode(key, parentDOM) {
        const node = activePrevNodeMap.get(key);
        if (parentDOM !== null) {
          const dom = getPrevElementByKeyOrThrow(key);
          parentDOM.removeChild(dom);
        }
        if (!activeNextNodeMap.has(key)) {
          activeEditor$1._keyToDOMMap.delete(key);
        }
        if ($isElementNode(node)) {
          const children = node.__children;
          destroyChildren(children, 0, children.length - 1, null);
        }
        if (node !== void 0) {
          setMutatedNode(mutatedNodes, activeEditorNodes, activeMutationListeners, node, "destroyed");
        }
      }
      function destroyChildren(children, _startIndex, endIndex, dom) {
        let startIndex = _startIndex;
        for (; startIndex <= endIndex; ++startIndex) {
          const child = children[startIndex];
          if (child !== void 0) {
            destroyNode(child, dom);
          }
        }
      }
      function setTextAlign(domStyle, value) {
        domStyle.setProperty("text-align", value);
      }
      function setElementIndent(dom, indent) {
        dom.style.setProperty("padding-inline-start", indent === 0 ? "" : indent * 40 + "px");
      }
      function setElementFormat(dom, format) {
        const domStyle = dom.style;
        if (format === 0) {
          setTextAlign(domStyle, "");
        } else if (format === IS_ALIGN_LEFT) {
          setTextAlign(domStyle, "left");
        } else if (format === IS_ALIGN_CENTER) {
          setTextAlign(domStyle, "center");
        } else if (format === IS_ALIGN_RIGHT) {
          setTextAlign(domStyle, "right");
        } else if (format === IS_ALIGN_JUSTIFY) {
          setTextAlign(domStyle, "justify");
        }
      }
      function createNode(key, parentDOM, insertDOM) {
        const node = activeNextNodeMap.get(key);
        if (node === void 0) {
          {
            throw Error(`createNode: node does not exist in nodeMap`);
          }
        }
        const dom = node.createDOM(activeEditorConfig, activeEditor$1);
        storeDOMWithKey(key, dom, activeEditor$1);
        if ($isTextNode(node)) {
          dom.setAttribute("data-lexical-text", "true");
        } else if ($isDecoratorNode(node)) {
          dom.setAttribute("data-lexical-decorator", "true");
        }
        if ($isElementNode(node)) {
          const indent = node.__indent;
          if (indent !== 0) {
            setElementIndent(dom, indent);
          }
          const children = node.__children;
          const childrenLength = children.length;
          if (childrenLength !== 0) {
            const endIndex = childrenLength - 1;
            createChildrenWithDirection(children, endIndex, node, dom);
          }
          const format = node.__format;
          if (format !== 0) {
            setElementFormat(dom, format);
          }
          reconcileElementTerminatingLineBreak(null, children, dom);
        } else {
          const text = node.getTextContent();
          if ($isDecoratorNode(node)) {
            const decorator = node.decorate(activeEditor$1);
            if (decorator !== null) {
              reconcileDecorator(key, decorator);
            }
            dom.contentEditable = "false";
          } else if ($isTextNode(node)) {
            if (!node.isDirectionless()) {
              subTreeDirectionedTextContent += text;
            }
            if (node.isInert()) {
              const domStyle = dom.style;
              domStyle.pointerEvents = "none";
              domStyle.userSelect = "none";
              dom.contentEditable = "false";
              domStyle.setProperty("-webkit-user-select", "none");
            }
          }
          subTreeTextContent += text;
          editorTextContent += text;
        }
        if (parentDOM !== null) {
          if (insertDOM != null) {
            parentDOM.insertBefore(dom, insertDOM);
          } else {
            const possibleLineBreak = parentDOM.__lexicalLineBreak;
            if (possibleLineBreak != null) {
              parentDOM.insertBefore(dom, possibleLineBreak);
            } else {
              parentDOM.appendChild(dom);
            }
          }
        }
        {
          Object.freeze(node);
        }
        setMutatedNode(mutatedNodes, activeEditorNodes, activeMutationListeners, node, "created");
        return dom;
      }
      function createChildrenWithDirection(children, endIndex, element, dom) {
        const previousSubTreeDirectionedTextContent = subTreeDirectionedTextContent;
        subTreeDirectionedTextContent = "";
        createChildren(children, 0, endIndex, dom, null);
        reconcileBlockDirection(element, dom);
        subTreeDirectionedTextContent = previousSubTreeDirectionedTextContent;
      }
      function createChildren(children, _startIndex, endIndex, dom, insertDOM) {
        const previousSubTreeTextContent = subTreeTextContent;
        subTreeTextContent = "";
        let startIndex = _startIndex;
        for (; startIndex <= endIndex; ++startIndex) {
          createNode(children[startIndex], dom, insertDOM);
        }
        dom.__lexicalTextContent = subTreeTextContent;
        subTreeTextContent = previousSubTreeTextContent + subTreeTextContent;
      }
      function isLastChildLineBreakOrDecorator(children, nodeMap) {
        const childKey = children[children.length - 1];
        const node = nodeMap.get(childKey);
        return $isLineBreakNode(node) || $isDecoratorNode(node);
      }
      function reconcileElementTerminatingLineBreak(prevChildren, nextChildren, dom) {
        const prevLineBreak = prevChildren !== null && (prevChildren.length === 0 || isLastChildLineBreakOrDecorator(prevChildren, activePrevNodeMap));
        const nextLineBreak = nextChildren !== null && (nextChildren.length === 0 || isLastChildLineBreakOrDecorator(nextChildren, activeNextNodeMap));
        if (prevLineBreak) {
          if (!nextLineBreak) {
            const element = dom.__lexicalLineBreak;
            if (element != null) {
              dom.removeChild(element);
            }
            dom.__lexicalLineBreak = null;
          }
        } else if (nextLineBreak) {
          const element = document.createElement("br");
          dom.__lexicalLineBreak = element;
          dom.appendChild(element);
        }
      }
      function reconcileBlockDirection(element, dom) {
        const previousSubTreeDirectionTextContent = dom.__lexicalDirTextContent;
        const previousDirection = dom.__lexicalDir;
        if (previousSubTreeDirectionTextContent !== subTreeDirectionedTextContent || previousDirection !== activeTextDirection) {
          const hasEmptyDirectionedTextContent = subTreeDirectionedTextContent === "";
          const direction = hasEmptyDirectionedTextContent ? activeTextDirection : getTextDirection(subTreeDirectionedTextContent);
          if (direction !== previousDirection) {
            const classList = dom.classList;
            const theme = activeEditorConfig.theme;
            let previousDirectionTheme = previousDirection !== null ? theme[previousDirection] : void 0;
            let nextDirectionTheme = direction !== null ? theme[direction] : void 0;
            if (previousDirectionTheme !== void 0) {
              if (typeof previousDirectionTheme === "string") {
                const classNamesArr = previousDirectionTheme.split(" ");
                previousDirectionTheme = theme[previousDirection] = classNamesArr;
              }
              classList.remove(...previousDirectionTheme);
            }
            if (direction === null || hasEmptyDirectionedTextContent && direction === "ltr") {
              dom.removeAttribute("dir");
            } else {
              if (nextDirectionTheme !== void 0) {
                if (typeof nextDirectionTheme === "string") {
                  const classNamesArr = nextDirectionTheme.split(" ");
                  nextDirectionTheme = theme[direction] = classNamesArr;
                }
                classList.add(...nextDirectionTheme);
              }
              dom.dir = direction;
            }
            if (!activeEditorStateReadOnly) {
              const writableNode = element.getWritable();
              writableNode.__dir = direction;
            }
          }
          activeTextDirection = direction;
          dom.__lexicalDirTextContent = subTreeDirectionedTextContent;
          dom.__lexicalDir = direction;
        }
      }
      function reconcileChildrenWithDirection(prevChildren, nextChildren, element, dom) {
        const previousSubTreeDirectionTextContent = subTreeDirectionedTextContent;
        subTreeDirectionedTextContent = "";
        reconcileChildren(prevChildren, nextChildren, dom);
        reconcileBlockDirection(element, dom);
        subTreeDirectionedTextContent = previousSubTreeDirectionTextContent;
      }
      function reconcileChildren(prevChildren, nextChildren, dom) {
        const previousSubTreeTextContent = subTreeTextContent;
        subTreeTextContent = "";
        const prevChildrenLength = prevChildren.length;
        const nextChildrenLength = nextChildren.length;
        if (prevChildrenLength === 1 && nextChildrenLength === 1) {
          const prevChildKey = prevChildren[0];
          const nextChildKey = nextChildren[0];
          if (prevChildKey === nextChildKey) {
            reconcileNode(prevChildKey, dom);
          } else {
            const lastDOM = getPrevElementByKeyOrThrow(prevChildKey);
            const replacementDOM = createNode(nextChildKey, null, null);
            dom.replaceChild(replacementDOM, lastDOM);
            destroyNode(prevChildKey, null);
          }
        } else if (prevChildrenLength === 0) {
          if (nextChildrenLength !== 0) {
            createChildren(nextChildren, 0, nextChildrenLength - 1, dom, null);
          }
        } else if (nextChildrenLength === 0) {
          if (prevChildrenLength !== 0) {
            const lexicalLineBreak = dom.__lexicalLineBreak;
            const canUseFastPath = lexicalLineBreak == null;
            destroyChildren(prevChildren, 0, prevChildrenLength - 1, canUseFastPath ? null : dom);
            if (canUseFastPath) {
              dom.textContent = "";
            }
          }
        } else {
          reconcileNodeChildren(prevChildren, nextChildren, prevChildrenLength, nextChildrenLength, dom);
        }
        dom.__lexicalTextContent = subTreeTextContent;
        subTreeTextContent = previousSubTreeTextContent + subTreeTextContent;
      }
      function reconcileNode(key, parentDOM) {
        const prevNode = activePrevNodeMap.get(key);
        let nextNode = activeNextNodeMap.get(key);
        if (prevNode === void 0 || nextNode === void 0) {
          {
            throw Error(`reconcileNode: prevNode or nextNode does not exist in nodeMap`);
          }
        }
        const isDirty = treatAllNodesAsDirty || activeDirtyLeaves.has(key) || activeDirtyElements.has(key);
        const dom = getElementByKeyOrThrow(activeEditor$1, key);
        if (prevNode === nextNode && !isDirty) {
          if ($isElementNode(prevNode)) {
            const previousSubTreeTextContent = dom.__lexicalTextContent;
            if (previousSubTreeTextContent !== void 0) {
              subTreeTextContent += previousSubTreeTextContent;
              editorTextContent += previousSubTreeTextContent;
            }
            const previousSubTreeDirectionTextContent = dom.__lexicalDirTextContent;
            if (previousSubTreeDirectionTextContent !== void 0) {
              subTreeDirectionedTextContent += previousSubTreeDirectionTextContent;
            }
          } else {
            const text = prevNode.getTextContent();
            if ($isTextNode(prevNode) && !prevNode.isDirectionless()) {
              subTreeDirectionedTextContent += text;
            }
            editorTextContent += text;
            subTreeTextContent += text;
          }
          return dom;
        }
        if (prevNode !== nextNode && isDirty) {
          setMutatedNode(mutatedNodes, activeEditorNodes, activeMutationListeners, nextNode, "updated");
        }
        if (nextNode.updateDOM(prevNode, dom, activeEditorConfig)) {
          const replacementDOM = createNode(key, null, null);
          if (parentDOM === null) {
            {
              throw Error(`reconcileNode: parentDOM is null`);
            }
          }
          parentDOM.replaceChild(replacementDOM, dom);
          destroyNode(key, null);
          return replacementDOM;
        }
        if ($isElementNode(prevNode) && $isElementNode(nextNode)) {
          const nextIndent = nextNode.__indent;
          if (nextIndent !== prevNode.__indent) {
            setElementIndent(dom, nextIndent);
          }
          const nextFormat = nextNode.__format;
          if (nextFormat !== prevNode.__format) {
            setElementFormat(dom, nextFormat);
          }
          const prevChildren = prevNode.__children;
          const nextChildren = nextNode.__children;
          const childrenAreDifferent = prevChildren !== nextChildren;
          if (childrenAreDifferent || isDirty) {
            reconcileChildrenWithDirection(prevChildren, nextChildren, nextNode, dom);
            if (!$isRootNode(nextNode)) {
              reconcileElementTerminatingLineBreak(prevChildren, nextChildren, dom);
            }
          }
        } else {
          const text = nextNode.getTextContent();
          if ($isDecoratorNode(nextNode)) {
            const decorator = nextNode.decorate(activeEditor$1);
            if (decorator !== null) {
              reconcileDecorator(key, decorator);
            }
          } else if ($isTextNode(nextNode) && !nextNode.isDirectionless()) {
            subTreeDirectionedTextContent += text;
          }
          subTreeTextContent += text;
          editorTextContent += text;
        }
        if (!activeEditorStateReadOnly && $isRootNode(nextNode) && nextNode.__cachedText !== editorTextContent) {
          nextNode = nextNode.getWritable();
          nextNode.__cachedText = editorTextContent;
        }
        {
          Object.freeze(nextNode);
        }
        return dom;
      }
      function reconcileDecorator(key, decorator) {
        let pendingDecorators = activeEditor$1._pendingDecorators;
        const currentDecorators = activeEditor$1._decorators;
        if (pendingDecorators === null) {
          if (currentDecorators[key] === decorator) {
            return;
          }
          pendingDecorators = cloneDecorators(activeEditor$1);
        }
        pendingDecorators[key] = decorator;
      }
      function getFirstChild(element) {
        return element.firstChild;
      }
      function getNextSibling(element) {
        return element.nextSibling;
      }
      function reconcileNodeChildren(prevChildren, nextChildren, prevChildrenLength, nextChildrenLength, dom) {
        const prevEndIndex = prevChildrenLength - 1;
        const nextEndIndex = nextChildrenLength - 1;
        let prevChildrenSet;
        let nextChildrenSet;
        let siblingDOM = getFirstChild(dom);
        let prevIndex = 0;
        let nextIndex = 0;
        while (prevIndex <= prevEndIndex && nextIndex <= nextEndIndex) {
          const prevKey = prevChildren[prevIndex];
          const nextKey = nextChildren[nextIndex];
          if (prevKey === nextKey) {
            siblingDOM = getNextSibling(reconcileNode(nextKey, dom));
            prevIndex++;
            nextIndex++;
          } else {
            if (prevChildrenSet === void 0) {
              prevChildrenSet = new Set(prevChildren);
            }
            if (nextChildrenSet === void 0) {
              nextChildrenSet = new Set(nextChildren);
            }
            const nextHasPrevKey = nextChildrenSet.has(prevKey);
            const prevHasNextKey = prevChildrenSet.has(nextKey);
            if (!nextHasPrevKey) {
              siblingDOM = getNextSibling(getPrevElementByKeyOrThrow(prevKey));
              destroyNode(prevKey, dom);
              prevIndex++;
            } else if (!prevHasNextKey) {
              createNode(nextKey, dom, siblingDOM);
              nextIndex++;
            } else {
              const childDOM = getElementByKeyOrThrow(activeEditor$1, nextKey);
              if (childDOM === siblingDOM) {
                siblingDOM = getNextSibling(reconcileNode(nextKey, dom));
              } else {
                if (siblingDOM != null) {
                  dom.insertBefore(childDOM, siblingDOM);
                } else {
                  dom.appendChild(childDOM);
                }
                reconcileNode(nextKey, dom);
              }
              prevIndex++;
              nextIndex++;
            }
          }
        }
        const appendNewChildren = prevIndex > prevEndIndex;
        const removeOldChildren = nextIndex > nextEndIndex;
        if (appendNewChildren && !removeOldChildren) {
          const previousNode = nextChildren[nextEndIndex + 1];
          const insertDOM = previousNode === void 0 ? null : activeEditor$1.getElementByKey(previousNode);
          createChildren(nextChildren, nextIndex, nextEndIndex, dom, insertDOM);
        } else if (removeOldChildren && !appendNewChildren) {
          destroyChildren(prevChildren, prevIndex, prevEndIndex, dom);
        }
      }
      function reconcileRoot(prevEditorState, nextEditorState, editor2, dirtyType, dirtyElements, dirtyLeaves) {
        subTreeTextContent = "";
        editorTextContent = "";
        subTreeDirectionedTextContent = "";
        treatAllNodesAsDirty = dirtyType === FULL_RECONCILE;
        activeTextDirection = null;
        activeEditor$1 = editor2;
        activeEditorConfig = editor2._config;
        activeEditorNodes = editor2._nodes;
        activeMutationListeners = activeEditor$1._listeners.mutation;
        activeDirtyElements = dirtyElements;
        activeDirtyLeaves = dirtyLeaves;
        activePrevNodeMap = prevEditorState._nodeMap;
        activeNextNodeMap = nextEditorState._nodeMap;
        activeEditorStateReadOnly = nextEditorState._readOnly;
        activePrevKeyToDOMMap = new Map(editor2._keyToDOMMap);
        const currentMutatedNodes = /* @__PURE__ */ new Map();
        mutatedNodes = currentMutatedNodes;
        reconcileNode("root", null);
        activeEditor$1 = void 0;
        activeEditorNodes = void 0;
        activeDirtyElements = void 0;
        activeDirtyLeaves = void 0;
        activePrevNodeMap = void 0;
        activeNextNodeMap = void 0;
        activeEditorConfig = void 0;
        activePrevKeyToDOMMap = void 0;
        mutatedNodes = void 0;
        return currentMutatedNodes;
      }
      function updateEditorState(rootElement, currentEditorState, pendingEditorState, currentSelection, pendingSelection, needsUpdate, editor2) {
        const observer = editor2._observer;
        let reconcileMutatedNodes = null;
        if (needsUpdate && observer !== null) {
          const dirtyType = editor2._dirtyType;
          const dirtyElements = editor2._dirtyElements;
          const dirtyLeaves = editor2._dirtyLeaves;
          observer.disconnect();
          try {
            reconcileMutatedNodes = reconcileRoot(currentEditorState, pendingEditorState, editor2, dirtyType, dirtyElements, dirtyLeaves);
          } finally {
            observer.observe(rootElement, {
              characterData: true,
              childList: true,
              subtree: true
            });
          }
        }
        const domSelection = getDOMSelection();
        if (domSelection !== null && (needsUpdate || pendingSelection === null || pendingSelection.dirty)) {
          reconcileSelection(currentSelection, pendingSelection, editor2, domSelection);
        }
        return reconcileMutatedNodes;
      }
      function scrollIntoViewIfNeeded(editor2, node, rootElement) {
        const element = node.nodeType === DOM_TEXT_TYPE ? node.parentNode : node;
        if (element !== null) {
          const rect = element.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            element.scrollIntoView(false);
          } else if (rect.top < 0) {
            element.scrollIntoView();
          } else if (rootElement) {
            const rootRect = rootElement.getBoundingClientRect();
            if (rect.bottom > rootRect.bottom) {
              element.scrollIntoView(false);
            } else if (rect.top < rootRect.top) {
              element.scrollIntoView();
            }
          }
          editor2._updateTags.add("scroll-into-view");
        }
      }
      function reconcileSelection(prevSelection, nextSelection, editor2, domSelection) {
        const anchorDOMNode = domSelection.anchorNode;
        const focusDOMNode = domSelection.focusNode;
        const anchorOffset = domSelection.anchorOffset;
        const focusOffset = domSelection.focusOffset;
        const activeElement = document.activeElement;
        const rootElement = editor2._rootElement;
        if (editor2._updateTags.has("collaboration") && activeElement !== rootElement) {
          return;
        }
        if (!$isRangeSelection(nextSelection)) {
          if (prevSelection !== null && isSelectionWithinEditor(editor2, anchorDOMNode, focusDOMNode)) {
            domSelection.removeAllRanges();
          }
          return;
        }
        const anchor = nextSelection.anchor;
        const focus = nextSelection.focus;
        {
          Object.freeze(anchor);
          Object.freeze(focus);
          Object.freeze(nextSelection);
        }
        const anchorKey = anchor.key;
        const focusKey = focus.key;
        const anchorDOM = getElementByKeyOrThrow(editor2, anchorKey);
        const focusDOM = getElementByKeyOrThrow(editor2, focusKey);
        const nextAnchorOffset = anchor.offset;
        const nextFocusOffset = focus.offset;
        let nextAnchorNode = anchorDOM;
        let nextFocusNode = focusDOM;
        if (anchor.type === "text") {
          nextAnchorNode = getDOMTextNode(anchorDOM);
        }
        if (focus.type === "text") {
          nextFocusNode = getDOMTextNode(focusDOM);
        }
        if (nextAnchorNode === null || nextFocusNode === null) {
          return;
        }
        if (anchorOffset === nextAnchorOffset && focusOffset === nextFocusOffset && anchorDOMNode === nextAnchorNode && focusDOMNode === nextFocusNode && !(domSelection.type === "Range" && nextSelection.isCollapsed())) {
          if (rootElement !== null && (activeElement === null || !rootElement.contains(activeElement))) {
            rootElement.focus({
              preventScroll: true
            });
          }
          return;
        }
        try {
          domSelection.setBaseAndExtent(nextAnchorNode, nextAnchorOffset, nextFocusNode, nextFocusOffset);
          if (nextSelection.isCollapsed() && rootElement === activeElement) {
            scrollIntoViewIfNeeded(editor2, nextAnchorNode, rootElement);
          }
        } catch (error) {
        }
      }
      function storeDOMWithKey(key, dom, editor2) {
        const keyToDOMMap = editor2._keyToDOMMap;
        dom["__lexicalKey_" + editor2._key] = key;
        keyToDOMMap.set(key, dom);
      }
      function getPrevElementByKeyOrThrow(key) {
        const element = activePrevKeyToDOMMap.get(key);
        if (element === void 0) {
          {
            throw Error(`Reconciliation: could not find DOM element for node key "${key}"`);
          }
        }
        return element;
      }
      function getElementByKeyOrThrow(editor2, key) {
        const element = editor2._keyToDOMMap.get(key);
        if (element === void 0) {
          {
            throw Error(`Reconciliation: could not find DOM element for node key "${key}"`);
          }
        }
        return element;
      }
      var activeEditorState = null;
      var activeEditor = null;
      var isReadOnlyMode = false;
      var isAttemptingToRecoverFromReconcilerError = false;
      var infiniteTransformCount = 0;
      function isCurrentlyReadOnlyMode() {
        return isReadOnlyMode;
      }
      function errorOnReadOnly() {
        if (isReadOnlyMode) {
          {
            throw Error(`Cannot use method in read-only mode.`);
          }
        }
      }
      function errorOnInfiniteTransforms() {
        if (infiniteTransformCount > 99) {
          {
            throw Error(`One or more transforms are endlessly triggering additional transforms. May have encountered infinite recursion caused by transforms that have their preconditions too lose and/or conflict with each other.`);
          }
        }
      }
      function getActiveEditorState() {
        if (activeEditorState === null) {
          {
            throw Error(`Unable to find an active editor state. State helpers or node methods can only be used synchronously during the callback of editor.update() or editorState.read().`);
          }
        }
        return activeEditorState;
      }
      function getActiveEditor() {
        if (activeEditor === null) {
          {
            throw Error(`Unable to find an active editor. This method can only be used synchronously during the callback of editor.update().`);
          }
        }
        return activeEditor;
      }
      function $applyTransforms(editor2, node, transformsCache) {
        const type = node.__type;
        const registeredNode = getRegisteredNodeOrThrow(editor2, type);
        let transformsArr = transformsCache.get(type);
        if (transformsArr === void 0) {
          transformsArr = Array.from(registeredNode.transforms);
          transformsCache.set(type, transformsArr);
        }
        const transformsArrLength = transformsArr.length;
        for (let i = 0; i < transformsArrLength; i++) {
          transformsArr[i](node);
          if (!node.isAttached()) {
            break;
          }
        }
      }
      function $isNodeValidForTransform(node, compositionKey) {
        return node !== void 0 && node.__key !== compositionKey && node.isAttached();
      }
      function $normalizeAllDirtyTextNodes(editorState, editor2) {
        const dirtyLeaves = editor2._dirtyLeaves;
        const nodeMap = editorState._nodeMap;
        for (const nodeKey of dirtyLeaves) {
          const node = nodeMap.get(nodeKey);
          if ($isTextNode(node) && node.isSimpleText() && !node.isUnmergeable()) {
            $normalizeTextNode(node);
          }
        }
      }
      function $applyAllTransforms(editorState, editor2) {
        const dirtyLeaves = editor2._dirtyLeaves;
        const dirtyElements = editor2._dirtyElements;
        const nodeMap = editorState._nodeMap;
        const compositionKey = $getCompositionKey();
        const transformsCache = /* @__PURE__ */ new Map();
        let untransformedDirtyLeaves = dirtyLeaves;
        let untransformedDirtyLeavesLength = untransformedDirtyLeaves.size;
        let untransformedDirtyElements = dirtyElements;
        let untransformedDirtyElementsLength = untransformedDirtyElements.size;
        while (untransformedDirtyLeavesLength > 0 || untransformedDirtyElementsLength > 0) {
          if (untransformedDirtyLeavesLength > 0) {
            editor2._dirtyLeaves = /* @__PURE__ */ new Set();
            for (const nodeKey of untransformedDirtyLeaves) {
              const node = nodeMap.get(nodeKey);
              if ($isTextNode(node) && node.isSimpleText() && !node.isUnmergeable()) {
                $normalizeTextNode(node);
              }
              if (node !== void 0 && $isNodeValidForTransform(node, compositionKey)) {
                $applyTransforms(editor2, node, transformsCache);
              }
              dirtyLeaves.add(nodeKey);
            }
            untransformedDirtyLeaves = editor2._dirtyLeaves;
            untransformedDirtyLeavesLength = untransformedDirtyLeaves.size;
            if (untransformedDirtyLeavesLength > 0) {
              infiniteTransformCount++;
              continue;
            }
          }
          editor2._dirtyLeaves = /* @__PURE__ */ new Set();
          editor2._dirtyElements = /* @__PURE__ */ new Map();
          for (const currentUntransformedDirtyElement of untransformedDirtyElements) {
            const nodeKey = currentUntransformedDirtyElement[0];
            const intentionallyMarkedAsDirty = currentUntransformedDirtyElement[1];
            if (nodeKey === "root" || !intentionallyMarkedAsDirty) {
              continue;
            }
            const node = nodeMap.get(nodeKey);
            if (node !== void 0 && $isNodeValidForTransform(node, compositionKey)) {
              $applyTransforms(editor2, node, transformsCache);
            }
            dirtyElements.set(nodeKey, intentionallyMarkedAsDirty);
          }
          untransformedDirtyLeaves = editor2._dirtyLeaves;
          untransformedDirtyLeavesLength = untransformedDirtyLeaves.size;
          untransformedDirtyElements = editor2._dirtyElements;
          untransformedDirtyElementsLength = untransformedDirtyElements.size;
          infiniteTransformCount++;
        }
        editor2._dirtyLeaves = dirtyLeaves;
        editor2._dirtyElements = dirtyElements;
      }
      function parseEditorState(parsedEditorState, editor2) {
        const nodeMap = /* @__PURE__ */ new Map();
        const editorState = new EditorState(nodeMap);
        const nodeParserState = {
          originalSelection: parsedEditorState._selection
        };
        const previousActiveEditorState = activeEditorState;
        const previousReadOnlyMode = isReadOnlyMode;
        const previousActiveEditor = activeEditor;
        activeEditorState = editorState;
        isReadOnlyMode = false;
        activeEditor = editor2;
        try {
          const parsedNodeMap = new Map(parsedEditorState._nodeMap);
          const parsedRoot = parsedNodeMap.get("root");
          internalCreateNodeFromParse(parsedRoot, parsedNodeMap, editor2, null, nodeParserState);
        } finally {
          activeEditorState = previousActiveEditorState;
          isReadOnlyMode = previousReadOnlyMode;
          activeEditor = previousActiveEditor;
        }
        editorState._selection = internalCreateSelectionFromParse(nodeParserState.remappedSelection || nodeParserState.originalSelection);
        return editorState;
      }
      function readEditorState(editorState, callbackFn) {
        const previousActiveEditorState = activeEditorState;
        const previousReadOnlyMode = isReadOnlyMode;
        const previousActiveEditor = activeEditor;
        activeEditorState = editorState;
        isReadOnlyMode = true;
        activeEditor = null;
        try {
          return callbackFn();
        } finally {
          activeEditorState = previousActiveEditorState;
          isReadOnlyMode = previousReadOnlyMode;
          activeEditor = previousActiveEditor;
        }
      }
      function handleDEVOnlyPendingUpdateGuarantees(pendingEditorState) {
        const nodeMap = pendingEditorState._nodeMap;
        nodeMap.set = () => {
          throw new Error("Cannot call set() on a frozen Lexical node map");
        };
        nodeMap.clear = () => {
          throw new Error("Cannot call clear() on a frozen Lexical node map");
        };
        nodeMap.delete = () => {
          throw new Error("Cannot call delete() on a frozen Lexical node map");
        };
      }
      function commitPendingUpdates(editor2) {
        const pendingEditorState = editor2._pendingEditorState;
        const rootElement = editor2._rootElement;
        if (rootElement === null || pendingEditorState === null) {
          return;
        }
        const currentEditorState = editor2._editorState;
        const currentSelection = currentEditorState._selection;
        const pendingSelection = pendingEditorState._selection;
        const needsUpdate = editor2._dirtyType !== NO_DIRTY_NODES;
        editor2._pendingEditorState = null;
        editor2._editorState = pendingEditorState;
        const previousActiveEditorState = activeEditorState;
        const previousReadOnlyMode = isReadOnlyMode;
        const previousActiveEditor = activeEditor;
        const previouslyUpdating = editor2._updating;
        activeEditor = editor2;
        activeEditorState = pendingEditorState;
        isReadOnlyMode = false;
        editor2._updating = true;
        try {
          const mutatedNodes2 = updateEditorState(rootElement, currentEditorState, pendingEditorState, currentSelection, pendingSelection, needsUpdate, editor2);
          if (mutatedNodes2 !== null) {
            triggerMutationListeners(editor2, currentEditorState, pendingEditorState, mutatedNodes2);
          }
        } catch (error) {
          editor2._onError(error);
          if (!isAttemptingToRecoverFromReconcilerError) {
            resetEditor(editor2, null, rootElement, pendingEditorState);
            initMutationObserver(editor2);
            editor2._dirtyType = FULL_RECONCILE;
            isAttemptingToRecoverFromReconcilerError = true;
            commitPendingUpdates(editor2);
            isAttemptingToRecoverFromReconcilerError = false;
          }
          return;
        } finally {
          editor2._updating = previouslyUpdating;
          activeEditorState = previousActiveEditorState;
          isReadOnlyMode = previousReadOnlyMode;
          activeEditor = previousActiveEditor;
        }
        pendingEditorState._readOnly = true;
        {
          handleDEVOnlyPendingUpdateGuarantees(pendingEditorState);
        }
        const dirtyLeaves = editor2._dirtyLeaves;
        const dirtyElements = editor2._dirtyElements;
        const normalizedNodes = editor2._normalizedNodes;
        const tags = editor2._updateTags;
        if (needsUpdate) {
          editor2._dirtyType = NO_DIRTY_NODES;
          editor2._cloneNotNeeded.clear();
          editor2._dirtyLeaves = /* @__PURE__ */ new Set();
          editor2._dirtyElements = /* @__PURE__ */ new Map();
          editor2._normalizedNodes = /* @__PURE__ */ new Set();
          editor2._updateTags = /* @__PURE__ */ new Set();
        }
        $garbageCollectDetachedDecorators(editor2, pendingEditorState);
        const pendingDecorators = editor2._pendingDecorators;
        if (pendingDecorators !== null) {
          editor2._decorators = pendingDecorators;
          editor2._pendingDecorators = null;
          triggerListeners("decorator", editor2, true, pendingDecorators);
        }
        triggerTextContentListeners(editor2, currentEditorState, pendingEditorState);
        triggerListeners("update", editor2, true, {
          dirtyElements,
          dirtyLeaves,
          editorState: pendingEditorState,
          normalizedNodes,
          prevEditorState: currentEditorState,
          tags
        });
        triggerDeferredUpdateCallbacks(editor2);
        triggerEnqueuedUpdates(editor2);
      }
      function triggerTextContentListeners(editor2, currentEditorState, pendingEditorState) {
        const currentTextContent = getEditorStateTextContent(currentEditorState);
        const latestTextContent = getEditorStateTextContent(pendingEditorState);
        if (currentTextContent !== latestTextContent) {
          triggerListeners("textcontent", editor2, true, latestTextContent);
        }
      }
      function triggerMutationListeners(editor2, currentEditorState, pendingEditorState, mutatedNodes2) {
        const listeners = editor2._listeners.mutation;
        listeners.forEach((klass, listener) => {
          const mutatedNodesByType = mutatedNodes2.get(klass);
          if (mutatedNodesByType === void 0) {
            return;
          }
          listener(mutatedNodesByType);
        });
      }
      function triggerListeners(type, editor2, isCurrentlyEnqueuingUpdates, ...payload) {
        const previouslyUpdating = editor2._updating;
        editor2._updating = isCurrentlyEnqueuingUpdates;
        try {
          const listeners = Array.from(editor2._listeners[type]);
          for (let i = 0; i < listeners.length; i++) {
            listeners[i](...payload);
          }
        } finally {
          editor2._updating = previouslyUpdating;
        }
      }
      function triggerCommandListeners(editor2, type, payload) {
        if (editor2._updating === false || activeEditor !== editor2) {
          let returnVal = false;
          editor2.update(() => {
            returnVal = triggerCommandListeners(editor2, type, payload);
          });
          return returnVal;
        }
        const editors = getEditorsToPropagate(editor2);
        for (let i = 4; i >= 0; i--) {
          for (let e = 0; e < editors.length; e++) {
            const currentEditor = editors[e];
            const commandListeners = currentEditor._commands;
            const listenerInPriorityOrder = commandListeners.get(type);
            if (listenerInPriorityOrder !== void 0) {
              const listeners = listenerInPriorityOrder[i];
              if (listeners !== void 0) {
                for (const listener of listeners) {
                  if (listener(payload, editor2) === true) {
                    return true;
                  }
                }
              }
            }
          }
        }
        return false;
      }
      function triggerEnqueuedUpdates(editor2) {
        const queuedUpdates = editor2._updates;
        if (queuedUpdates.length !== 0) {
          const [updateFn, options] = queuedUpdates.shift();
          beginUpdate(editor2, updateFn, options);
        }
      }
      function triggerDeferredUpdateCallbacks(editor2) {
        const deferred = editor2._deferred;
        editor2._deferred = [];
        if (deferred.length !== 0) {
          const previouslyUpdating = editor2._updating;
          editor2._updating = true;
          try {
            for (let i = 0; i < deferred.length; i++) {
              deferred[i]();
            }
          } finally {
            editor2._updating = previouslyUpdating;
          }
        }
      }
      function processNestedUpdates(editor2) {
        const queuedUpdates = editor2._updates;
        let skipTransforms = false;
        while (queuedUpdates.length !== 0) {
          const [nextUpdateFn, options] = queuedUpdates.shift();
          let onUpdate;
          let tag;
          if (options !== void 0) {
            onUpdate = options.onUpdate;
            tag = options.tag;
            if (options.skipTransforms) {
              skipTransforms = true;
            }
            if (onUpdate) {
              editor2._deferred.push(onUpdate);
            }
            if (tag) {
              editor2._updateTags.add(tag);
            }
          }
          nextUpdateFn();
        }
        return skipTransforms;
      }
      function beginUpdate(editor2, updateFn, options) {
        const updateTags = editor2._updateTags;
        let onUpdate;
        let tag;
        let skipTransforms = false;
        if (options !== void 0) {
          onUpdate = options.onUpdate;
          tag = options.tag;
          if (tag != null) {
            updateTags.add(tag);
          }
          skipTransforms = options.skipTransforms;
        }
        if (onUpdate) {
          editor2._deferred.push(onUpdate);
        }
        const currentEditorState = editor2._editorState;
        let pendingEditorState = editor2._pendingEditorState;
        let editorStateWasCloned = false;
        if (pendingEditorState === null) {
          pendingEditorState = editor2._pendingEditorState = cloneEditorState(currentEditorState);
          editorStateWasCloned = true;
        }
        const previousActiveEditorState = activeEditorState;
        const previousReadOnlyMode = isReadOnlyMode;
        const previousActiveEditor = activeEditor;
        const previouslyUpdating = editor2._updating;
        activeEditorState = pendingEditorState;
        isReadOnlyMode = false;
        editor2._updating = true;
        activeEditor = editor2;
        try {
          if (editorStateWasCloned) {
            pendingEditorState._selection = internalCreateSelection(editor2);
          }
          const startingCompositionKey = editor2._compositionKey;
          updateFn();
          skipTransforms = processNestedUpdates(editor2);
          applySelectionTransforms(pendingEditorState, editor2);
          if (editor2._dirtyType !== NO_DIRTY_NODES) {
            if (skipTransforms) {
              $normalizeAllDirtyTextNodes(pendingEditorState, editor2);
            } else {
              $applyAllTransforms(pendingEditorState, editor2);
            }
            processNestedUpdates(editor2);
            $garbageCollectDetachedNodes(currentEditorState, pendingEditorState, editor2._dirtyLeaves, editor2._dirtyElements);
          }
          const endingCompositionKey = editor2._compositionKey;
          if (startingCompositionKey !== endingCompositionKey) {
            pendingEditorState._flushSync = true;
          }
          const pendingSelection = pendingEditorState._selection;
          if ($isRangeSelection(pendingSelection)) {
            const pendingNodeMap = pendingEditorState._nodeMap;
            const anchorKey = pendingSelection.anchor.key;
            const focusKey = pendingSelection.focus.key;
            if (pendingNodeMap.get(anchorKey) === void 0 || pendingNodeMap.get(focusKey) === void 0) {
              {
                throw Error(`updateEditor: selection has been lost because the previously selected nodes have been removed and selection wasn't moved to another node. Ensure selection changes after removing/replacing a selected node.`);
              }
            }
          } else if ($isNodeSelection(pendingSelection)) {
            if (pendingSelection._nodes.size === 0) {
              pendingEditorState._selection = null;
            }
          }
        } catch (error) {
          editor2._onError(error);
          editor2._pendingEditorState = currentEditorState;
          editor2._dirtyType = FULL_RECONCILE;
          editor2._cloneNotNeeded.clear();
          editor2._dirtyLeaves = /* @__PURE__ */ new Set();
          editor2._dirtyElements.clear();
          commitPendingUpdates(editor2);
          return;
        } finally {
          activeEditorState = previousActiveEditorState;
          isReadOnlyMode = previousReadOnlyMode;
          activeEditor = previousActiveEditor;
          editor2._updating = previouslyUpdating;
          infiniteTransformCount = 0;
        }
        const shouldUpdate = editor2._dirtyType !== NO_DIRTY_NODES || editorStateHasDirtySelection(pendingEditorState, editor2);
        if (shouldUpdate) {
          if (pendingEditorState._flushSync) {
            pendingEditorState._flushSync = false;
            commitPendingUpdates(editor2);
          } else if (editorStateWasCloned) {
            scheduleMicroTask(() => {
              commitPendingUpdates(editor2);
            });
          }
        } else {
          pendingEditorState._flushSync = false;
          if (editorStateWasCloned) {
            updateTags.clear();
            editor2._deferred = [];
            editor2._pendingEditorState = null;
          }
        }
      }
      function updateEditor(editor2, updateFn, options) {
        if (editor2._updating) {
          editor2._updates.push([updateFn, options]);
        } else {
          beginUpdate(editor2, updateFn, options);
        }
      }
      var TEXT_MUTATION_VARIANCE = 100;
      var isProcessingMutations = false;
      var lastTextEntryTimeStamp = 0;
      function getIsProcesssingMutations() {
        return isProcessingMutations;
      }
      function updateTimeStamp(event) {
        lastTextEntryTimeStamp = event.timeStamp;
      }
      function initTextEntryListener() {
        if (lastTextEntryTimeStamp === 0) {
          window.addEventListener("textInput", updateTimeStamp, true);
        }
      }
      function isManagedLineBreak(dom, target, editor2) {
        return target.__lexicalLineBreak === dom || dom["__lexicalKey_" + editor2._key] !== void 0;
      }
      function getLastSelection(editor2) {
        return editor2.getEditorState().read(() => {
          const selection = $getSelection();
          return selection !== null ? selection.clone() : null;
        });
      }
      function handleTextMutation(target, node, editor2) {
        const domSelection = getDOMSelection();
        let anchorOffset = null;
        let focusOffset = null;
        if (domSelection !== null && domSelection.anchorNode === target) {
          anchorOffset = domSelection.anchorOffset;
          focusOffset = domSelection.focusOffset;
        }
        const text = target.nodeValue;
        $updateTextNodeFromDOMContent(node, text, anchorOffset, focusOffset, false);
      }
      function $flushMutations(editor2, mutations, observer) {
        isProcessingMutations = true;
        const shouldFlushTextMutations = performance.now() - lastTextEntryTimeStamp > TEXT_MUTATION_VARIANCE;
        try {
          updateEditor(editor2, () => {
            const badDOMTargets = /* @__PURE__ */ new Map();
            const rootElement = editor2.getRootElement();
            const currentEditorState = editor2._editorState;
            let shouldRevertSelection = false;
            let possibleTextForFirefoxPaste = "";
            for (let i = 0; i < mutations.length; i++) {
              const mutation = mutations[i];
              const type = mutation.type;
              const targetDOM = mutation.target;
              let targetNode = $getNearestNodeFromDOMNode(targetDOM, currentEditorState);
              if ($isDecoratorNode(targetNode)) {
                continue;
              }
              if (type === "characterData") {
                if (shouldFlushTextMutations && targetDOM.nodeType === DOM_TEXT_TYPE && $isTextNode(targetNode) && targetNode.isAttached()) {
                  handleTextMutation(targetDOM, targetNode);
                }
              } else if (type === "childList") {
                shouldRevertSelection = true;
                const addedDOMs = mutation.addedNodes;
                for (let s = 0; s < addedDOMs.length; s++) {
                  const addedDOM = addedDOMs[s];
                  const node = getNodeFromDOMNode(addedDOM);
                  const parentDOM = addedDOM.parentNode;
                  if (parentDOM != null && node === null && (addedDOM.nodeName !== "BR" || !isManagedLineBreak(addedDOM, parentDOM, editor2))) {
                    if (IS_FIREFOX) {
                      const possibleText = addedDOM.innerText || addedDOM.nodeValue;
                      if (possibleText) {
                        possibleTextForFirefoxPaste += possibleText;
                      }
                    }
                    parentDOM.removeChild(addedDOM);
                  }
                }
                const removedDOMs = mutation.removedNodes;
                const removedDOMsLength = removedDOMs.length;
                if (removedDOMsLength > 0) {
                  let unremovedBRs = 0;
                  for (let s = 0; s < removedDOMsLength; s++) {
                    const removedDOM = removedDOMs[s];
                    if (removedDOM.nodeName === "BR" && isManagedLineBreak(removedDOM, targetDOM, editor2)) {
                      targetDOM.appendChild(removedDOM);
                      unremovedBRs++;
                    }
                  }
                  if (removedDOMsLength !== unremovedBRs) {
                    if (targetDOM === rootElement) {
                      targetNode = internalGetRoot(currentEditorState);
                    }
                    badDOMTargets.set(targetDOM, targetNode);
                  }
                }
              }
            }
            if (badDOMTargets.size > 0) {
              for (const [targetDOM, targetNode] of badDOMTargets) {
                if ($isElementNode(targetNode)) {
                  const childKeys = targetNode.__children;
                  let currentDOM = targetDOM.firstChild;
                  for (let s = 0; s < childKeys.length; s++) {
                    const key = childKeys[s];
                    const correctDOM = editor2.getElementByKey(key);
                    if (correctDOM === null) {
                      continue;
                    }
                    if (currentDOM == null) {
                      targetDOM.appendChild(correctDOM);
                      currentDOM = correctDOM;
                    } else if (currentDOM !== correctDOM) {
                      targetDOM.replaceChild(correctDOM, currentDOM);
                    }
                    currentDOM = currentDOM.nextSibling;
                  }
                } else if ($isTextNode(targetNode)) {
                  targetNode.markDirty();
                }
              }
            }
            const records = observer.takeRecords();
            if (records.length > 0) {
              for (let i = 0; i < records.length; i++) {
                const record = records[i];
                const addedNodes = record.addedNodes;
                const target = record.target;
                for (let s = 0; s < addedNodes.length; s++) {
                  const addedDOM = addedNodes[s];
                  const parentDOM = addedDOM.parentNode;
                  if (parentDOM != null && addedDOM.nodeName === "BR" && !isManagedLineBreak(addedDOM, target, editor2)) {
                    parentDOM.removeChild(addedDOM);
                  }
                }
              }
              observer.takeRecords();
            }
            const selection = $getSelection() || getLastSelection(editor2);
            if (selection !== null) {
              if (shouldRevertSelection) {
                selection.dirty = true;
                $setSelection(selection);
              }
              if (IS_FIREFOX && isFirefoxClipboardEvents()) {
                selection.insertRawText(possibleTextForFirefoxPaste);
              }
            }
          });
        } finally {
          isProcessingMutations = false;
        }
      }
      function flushRootMutations(editor2) {
        const observer = editor2._observer;
        if (observer !== null) {
          const mutations = observer.takeRecords();
          $flushMutations(editor2, mutations, observer);
        }
      }
      function initMutationObserver(editor2) {
        initTextEntryListener();
        editor2._observer = new MutationObserver((mutations, observer) => {
          $flushMutations(editor2, mutations, observer);
        });
      }
      var Point = class {
        constructor(key, offset, type) {
          this.key = key;
          this.offset = offset;
          this.type = type;
        }
        is(point) {
          return this.key === point.key && this.offset === point.offset && this.type === point.type;
        }
        isBefore(b) {
          let aNode = this.getNode();
          let bNode = b.getNode();
          const aOffset = this.offset;
          const bOffset = b.offset;
          if ($isElementNode(aNode)) {
            aNode = aNode.getDescendantByIndex(aOffset);
          }
          if ($isElementNode(bNode)) {
            bNode = bNode.getDescendantByIndex(bOffset);
          }
          if (aNode === bNode) {
            return aOffset < bOffset;
          }
          return aNode.isBefore(bNode);
        }
        getCharacterOffset() {
          return this.type === "text" ? this.offset : 0;
        }
        getNode() {
          const key = this.key;
          const node = $getNodeByKey(key);
          if (node === null) {
            {
              throw Error(`Point.getNode: node not found`);
            }
          }
          return node;
        }
        set(key, offset, type) {
          const selection = $getSelection();
          const oldKey = this.key;
          this.key = key;
          this.offset = offset;
          this.type = type;
          if (!isCurrentlyReadOnlyMode()) {
            if ($getCompositionKey() === oldKey) {
              $setCompositionKey(key);
            }
            if (selection !== null && (selection.anchor === this || selection.focus === this)) {
              selection.dirty = true;
            }
          }
        }
      };
      function $createPoint(key, offset, type) {
        return new Point(key, offset, type);
      }
      function selectPointOnNode(point, node) {
        const key = node.__key;
        let offset = point.offset;
        let type = "element";
        if ($isTextNode(node)) {
          type = "text";
          const textContentLength = node.getTextContentSize();
          if (offset > textContentLength) {
            offset = textContentLength;
          }
        }
        point.set(key, offset, type);
      }
      function $moveSelectionPointToEnd(point, node) {
        if ($isElementNode(node)) {
          const lastNode = node.getLastDescendant();
          if ($isElementNode(lastNode) || $isTextNode(lastNode)) {
            selectPointOnNode(point, lastNode);
          } else {
            selectPointOnNode(point, node);
          }
        } else if ($isTextNode(node)) {
          selectPointOnNode(point, node);
        }
      }
      function $transferStartingElementPointToTextPoint(start, end, format) {
        const element = start.getNode();
        const placementNode = element.getChildAtIndex(start.offset);
        const textNode = $createTextNode();
        const target = $isRootNode(element) ? $createParagraphNode().append(textNode) : textNode;
        textNode.setFormat(format);
        if (placementNode === null) {
          element.append(target);
        } else {
          placementNode.insertBefore(target);
        }
        if (start.is(end)) {
          end.set(textNode.__key, 0, "text");
        }
        start.set(textNode.__key, 0, "text");
      }
      function $setPointValues(point, key, offset, type) {
        point.key = key;
        point.offset = offset;
        point.type = type;
      }
      var NodeSelection = class {
        constructor(objects) {
          this.dirty = false;
          this._nodes = objects;
        }
        is(selection) {
          if (!$isNodeSelection(selection)) {
            return false;
          }
          const a = this._nodes;
          const b = selection._nodes;
          return a.size === b.size && Array.from(a).every((key) => b.has(key));
        }
        add(key) {
          this.dirty = true;
          this._nodes.add(key);
        }
        delete(key) {
          this.dirty = true;
          this._nodes.delete(key);
        }
        clear() {
          this.dirty = true;
          this._nodes.clear();
        }
        has(key) {
          return this._nodes.has(key);
        }
        clone() {
          return new NodeSelection(new Set(this._nodes));
        }
        extract() {
          return this.getNodes();
        }
        insertRawText(text) {
        }
        insertText() {
        }
        getNodes() {
          const objects = this._nodes;
          const nodes = [];
          for (const object of objects) {
            const node = $getNodeByKey(object);
            if (node !== null) {
              nodes.push(node);
            }
          }
          return nodes;
        }
        getTextContent() {
          const nodes = this.getNodes();
          let textContent = "";
          for (let i = 0; i < nodes.length; i++) {
            textContent += nodes[i].getTextContent();
          }
          return textContent;
        }
      };
      function $isRangeSelection(x) {
        return x instanceof RangeSelection;
      }
      var GridSelection = class {
        constructor(gridKey, anchorCellKey, focusCellKey) {
          this.gridKey = gridKey;
          this.anchorCellKey = anchorCellKey;
          this.anchor = $createPoint(anchorCellKey, 0, "element");
          this.focusCellKey = focusCellKey;
          this.focus = $createPoint(focusCellKey, 0, "element");
          this.dirty = false;
        }
        is(selection) {
          if (!$isGridSelection(selection)) {
            return false;
          }
          return this.gridKey === selection.gridKey && this.anchorCellKey === selection.anchorCellKey && this.focusCellKey === selection.focusCellKey;
        }
        set(gridKey, anchorCellKey, focusCellKey) {
          this.dirty = true;
          this.gridKey = gridKey;
          this.anchorCellKey = anchorCellKey;
          this.focusCellKey = focusCellKey;
        }
        clone() {
          return new GridSelection(this.gridKey, this.anchorCellKey, this.focusCellKey);
        }
        isCollapsed() {
          return false;
        }
        isBackward() {
          return this.focus.isBefore(this.anchor);
        }
        extract() {
          return this.getNodes();
        }
        insertRawText(text) {
        }
        insertText() {
        }
        getShape() {
          const anchorCellNode = $getNodeByKey(this.anchorCellKey);
          if (!anchorCellNode) {
            throw Error(`getNodes: expected to find AnchorNode`);
          }
          const anchorCellNodeIndex = anchorCellNode.getIndexWithinParent();
          const anchorCelRoweIndex = anchorCellNode.getParentOrThrow().getIndexWithinParent();
          const focusCellNode = $getNodeByKey(this.focusCellKey);
          if (!focusCellNode) {
            throw Error(`getNodes: expected to find FocusNode`);
          }
          const focusCellNodeIndex = focusCellNode.getIndexWithinParent();
          const focusCellRowIndex = focusCellNode.getParentOrThrow().getIndexWithinParent();
          const startX = Math.min(anchorCellNodeIndex, focusCellNodeIndex);
          const stopX = Math.max(anchorCellNodeIndex, focusCellNodeIndex);
          const startY = Math.min(anchorCelRoweIndex, focusCellRowIndex);
          const stopY = Math.max(anchorCelRoweIndex, focusCellRowIndex);
          return {
            fromX: Math.min(startX, stopX),
            fromY: Math.min(startY, stopY),
            toX: Math.max(startX, stopX),
            toY: Math.max(startY, stopY)
          };
        }
        getNodes() {
          const nodes = /* @__PURE__ */ new Set();
          const {
            fromX,
            fromY,
            toX,
            toY
          } = this.getShape();
          const gridNode = $getNodeByKey(this.gridKey);
          if (!$isGridNode(gridNode)) {
            {
              throw Error(`getNodes: expected to find GridNode`);
            }
          }
          nodes.add(gridNode);
          const gridRowNodes = gridNode.getChildren();
          for (let r = fromY; r <= toY; r++) {
            const gridRowNode = gridRowNodes[r];
            nodes.add(gridRowNode);
            if (!$isGridRowNode(gridRowNode)) {
              {
                throw Error(`getNodes: expected to find GridRowNode`);
              }
            }
            const gridCellNodes = gridRowNode.getChildren();
            for (let c = fromX; c <= toX; c++) {
              const gridCellNode = gridCellNodes[c];
              if (!$isGridCellNode(gridCellNode)) {
                {
                  throw Error(`getNodes: expected to find GridCellNode`);
                }
              }
              nodes.add(gridCellNode);
              const children = gridCellNode.getChildren();
              while (children.length > 0) {
                const child = children.shift();
                nodes.add(child);
                if ($isElementNode(child)) {
                  children.unshift(...child.getChildren());
                }
              }
            }
          }
          return Array.from(nodes);
        }
        getTextContent() {
          const nodes = this.getNodes();
          let textContent = "";
          for (let i = 0; i < nodes.length; i++) {
            textContent += nodes[i].getTextContent();
          }
          return textContent;
        }
      };
      function $isGridSelection(x) {
        return x instanceof GridSelection;
      }
      var RangeSelection = class {
        constructor(anchor, focus, format) {
          this.anchor = anchor;
          this.focus = focus;
          this.dirty = false;
          this.format = format;
        }
        is(selection) {
          if (!$isRangeSelection(selection)) {
            return false;
          }
          return this.anchor.is(selection.anchor) && this.focus.is(selection.focus) && this.format === selection.format;
        }
        isBackward() {
          return this.focus.isBefore(this.anchor);
        }
        isCollapsed() {
          return this.anchor.is(this.focus);
        }
        getNodes() {
          const anchor = this.anchor;
          const focus = this.focus;
          let firstNode = anchor.getNode();
          let lastNode = focus.getNode();
          if ($isElementNode(firstNode)) {
            firstNode = firstNode.getDescendantByIndex(anchor.offset);
          }
          if ($isElementNode(lastNode)) {
            lastNode = lastNode.getDescendantByIndex(focus.offset);
          }
          if (firstNode.is(lastNode)) {
            if ($isElementNode(firstNode)) {
              return [];
            }
            return [firstNode];
          }
          return firstNode.getNodesBetween(lastNode);
        }
        setTextNodeRange(anchorNode, anchorOffset, focusNode, focusOffset) {
          $setPointValues(this.anchor, anchorNode.__key, anchorOffset, "text");
          $setPointValues(this.focus, focusNode.__key, focusOffset, "text");
          this.dirty = true;
        }
        getTextContent() {
          const nodes = this.getNodes();
          if (nodes.length === 0) {
            return "";
          }
          const firstNode = nodes[0];
          const lastNode = nodes[nodes.length - 1];
          const anchor = this.anchor;
          const focus = this.focus;
          const isBefore = anchor.isBefore(focus);
          const anchorOffset = anchor.getCharacterOffset();
          const focusOffset = focus.getCharacterOffset();
          let textContent = "";
          let prevWasElement = true;
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if ($isElementNode(node) && !node.isInline()) {
              if (!prevWasElement) {
                textContent += "\n";
              }
              if (node.isEmpty()) {
                prevWasElement = false;
              } else {
                prevWasElement = true;
              }
            } else {
              prevWasElement = false;
              if ($isTextNode(node)) {
                let text = node.getTextContent();
                if (node === firstNode) {
                  if (node === lastNode) {
                    text = anchorOffset < focusOffset ? text.slice(anchorOffset, focusOffset) : text.slice(focusOffset, anchorOffset);
                  } else {
                    text = isBefore ? text.slice(anchorOffset) : text.slice(focusOffset);
                  }
                } else if (node === lastNode) {
                  text = isBefore ? text.slice(0, focusOffset) : text.slice(0, anchorOffset);
                }
                textContent += text;
              } else if (($isDecoratorNode(node) || $isLineBreakNode(node)) && (node !== lastNode || !this.isCollapsed())) {
                textContent += node.getTextContent();
              }
            }
          }
          return textContent;
        }
        applyDOMRange(range) {
          const editor2 = getActiveEditor();
          const currentEditorState = editor2.getEditorState();
          const lastSelection = currentEditorState._selection;
          const resolvedSelectionPoints = internalResolveSelectionPoints(range.startContainer, range.startOffset, range.endContainer, range.endOffset, editor2, lastSelection);
          if (resolvedSelectionPoints === null) {
            return;
          }
          const [anchorPoint, focusPoint] = resolvedSelectionPoints;
          $setPointValues(this.anchor, anchorPoint.key, anchorPoint.offset, anchorPoint.type);
          $setPointValues(this.focus, focusPoint.key, focusPoint.offset, focusPoint.type);
        }
        clone() {
          const anchor = this.anchor;
          const focus = this.focus;
          return new RangeSelection($createPoint(anchor.key, anchor.offset, anchor.type), $createPoint(focus.key, focus.offset, focus.type), this.format);
        }
        toggleFormat(format) {
          this.format = toggleTextFormatType(this.format, format, null);
          this.dirty = true;
        }
        hasFormat(type) {
          const formatFlag = TEXT_TYPE_TO_FORMAT[type];
          return (this.format & formatFlag) !== 0;
        }
        insertRawText(text) {
          const parts = text.split(/\r?\n/);
          if (parts.length === 1) {
            this.insertText(text);
          } else {
            const nodes = [];
            const length = parts.length;
            for (let i = 0; i < length; i++) {
              const part = parts[i];
              if (part !== "") {
                nodes.push($createTextNode(part));
              }
              if (i !== length - 1) {
                nodes.push($createLineBreakNode());
              }
            }
            this.insertNodes(nodes);
          }
        }
        insertText(text) {
          const anchor = this.anchor;
          const focus = this.focus;
          const isBefore = this.isCollapsed() || anchor.isBefore(focus);
          const format = this.format;
          if (isBefore && anchor.type === "element") {
            $transferStartingElementPointToTextPoint(anchor, focus, format);
          } else if (!isBefore && focus.type === "element") {
            $transferStartingElementPointToTextPoint(focus, anchor, format);
          }
          const selectedNodes = this.getNodes();
          const selectedNodesLength = selectedNodes.length;
          const firstPoint = isBefore ? anchor : focus;
          const endPoint = isBefore ? focus : anchor;
          const startOffset = firstPoint.offset;
          const endOffset = endPoint.offset;
          let firstNode = selectedNodes[0];
          if (!$isTextNode(firstNode)) {
            {
              throw Error(`insertText: first node is not a text node`);
            }
          }
          const firstNodeText = firstNode.getTextContent();
          const firstNodeTextLength = firstNodeText.length;
          const firstNodeParent = firstNode.getParentOrThrow();
          if (this.isCollapsed() && startOffset === firstNodeTextLength && (firstNode.isSegmented() || firstNode.isToken() || !firstNode.canInsertTextAfter() || !firstNodeParent.canInsertTextAfter())) {
            let nextSibling = firstNode.getNextSibling();
            if (!$isTextNode(nextSibling) || $isTokenOrInert(nextSibling) || nextSibling.isSegmented()) {
              nextSibling = $createTextNode();
              if (!firstNodeParent.canInsertTextAfter()) {
                firstNodeParent.insertAfter(nextSibling);
              } else {
                firstNode.insertAfter(nextSibling);
              }
            }
            nextSibling.select(0, 0);
            firstNode = nextSibling;
            if (text !== "") {
              this.insertText(text);
              return;
            }
          } else if (this.isCollapsed() && startOffset === 0 && (firstNode.isSegmented() || firstNode.isToken() || !firstNode.canInsertTextBefore() || !firstNodeParent.canInsertTextBefore())) {
            let prevSibling = firstNode.getPreviousSibling();
            if (!$isTextNode(prevSibling) || $isTokenOrInert(prevSibling) || prevSibling.isSegmented()) {
              prevSibling = $createTextNode();
              if (!firstNodeParent.canInsertTextBefore()) {
                firstNodeParent.insertBefore(prevSibling);
              } else {
                firstNode.insertBefore(prevSibling);
              }
            }
            prevSibling.select();
            firstNode = prevSibling;
            if (text !== "") {
              this.insertText(text);
              return;
            }
          } else if (firstNode.isSegmented() && startOffset !== firstNodeTextLength) {
            const textNode = $createTextNode(firstNode.getTextContent());
            firstNode.replace(textNode);
            firstNode = textNode;
          }
          if (selectedNodesLength === 1) {
            if ($isTokenOrInert(firstNode)) {
              const textNode = $createTextNode(text);
              textNode.select();
              firstNode.replace(textNode);
              return;
            }
            const firstNodeFormat = firstNode.getFormat();
            if (startOffset === endOffset && firstNodeFormat !== format) {
              if (firstNode.getTextContent() === "") {
                firstNode.setFormat(format);
              } else {
                const textNode = $createTextNode(text);
                textNode.setFormat(format);
                textNode.select();
                if (startOffset === 0) {
                  firstNode.insertBefore(textNode);
                } else {
                  const [targetNode] = firstNode.splitText(startOffset);
                  targetNode.insertAfter(textNode);
                }
                if (textNode.isComposing() && this.anchor.type === "text") {
                  this.anchor.offset -= text.length;
                }
                return;
              }
            }
            const delCount = endOffset - startOffset;
            firstNode = firstNode.spliceText(startOffset, delCount, text, true);
            if (firstNode.getTextContent() === "") {
              firstNode.remove();
            } else if (firstNode.isComposing() && this.anchor.type === "text") {
              this.anchor.offset -= text.length;
            }
          } else {
            const lastIndex = selectedNodesLength - 1;
            let lastNode = selectedNodes[lastIndex];
            const markedNodeKeysForKeep = /* @__PURE__ */ new Set([...firstNode.getParentKeys(), ...lastNode.getParentKeys()]);
            const firstElement = $isElementNode(firstNode) ? firstNode : firstNode.getParentOrThrow();
            const lastElement = $isElementNode(lastNode) ? lastNode : lastNode.getParentOrThrow();
            if (endPoint.type === "text" && (endOffset !== 0 || lastNode.getTextContent() === "") || endPoint.type === "element" && lastNode.getIndexWithinParent() < endOffset) {
              if ($isTextNode(lastNode) && !$isTokenOrInert(lastNode) && endOffset !== lastNode.getTextContentSize()) {
                if (lastNode.isSegmented()) {
                  const textNode = $createTextNode(lastNode.getTextContent());
                  lastNode.replace(textNode);
                  lastNode = textNode;
                }
                lastNode = lastNode.spliceText(0, endOffset, "");
                markedNodeKeysForKeep.add(lastNode.__key);
              } else {
                lastNode.remove();
              }
            } else {
              markedNodeKeysForKeep.add(lastNode.__key);
            }
            const lastNodeChildren = lastElement.getChildren();
            const selectedNodesSet = new Set(selectedNodes);
            const firstAndLastElementsAreEqual = firstElement.is(lastElement);
            if (!lastElement.canBeEmpty() && firstElement !== lastElement) {
              firstElement.append(lastElement);
            } else {
              for (let i = lastNodeChildren.length - 1; i >= 0; i--) {
                const lastNodeChild = lastNodeChildren[i];
                if (lastNodeChild.is(firstNode) || $isElementNode(lastNodeChild) && lastNodeChild.isParentOf(firstNode)) {
                  break;
                }
                if (lastNodeChild.isAttached()) {
                  if (!selectedNodesSet.has(lastNodeChild) || lastNodeChild.is(lastNode)) {
                    if (!firstAndLastElementsAreEqual) {
                      firstNode.insertAfter(lastNodeChild);
                    }
                  } else {
                    lastNodeChild.remove();
                  }
                }
              }
              if (!firstAndLastElementsAreEqual) {
                let parent = lastElement;
                let lastRemovedParent = null;
                while (parent !== null) {
                  const children = parent.getChildren();
                  const childrenLength = children.length;
                  if (childrenLength === 0 || children[childrenLength - 1].is(lastRemovedParent)) {
                    markedNodeKeysForKeep.delete(parent.__key);
                    lastRemovedParent = parent;
                  }
                  parent = parent.getParent();
                }
              }
            }
            if (!$isTokenOrInert(firstNode)) {
              firstNode = firstNode.spliceText(startOffset, firstNodeTextLength - startOffset, text, true);
              if (firstNode.getTextContent() === "") {
                firstNode.remove();
              } else if (firstNode.isComposing() && this.anchor.type === "text") {
                this.anchor.offset -= text.length;
              }
            } else if (startOffset === firstNodeTextLength) {
              firstNode.select();
            } else {
              const textNode = $createTextNode(text);
              textNode.select();
              firstNode.replace(textNode);
            }
            for (let i = 1; i < selectedNodesLength; i++) {
              const selectedNode = selectedNodes[i];
              const key = selectedNode.__key;
              if (!markedNodeKeysForKeep.has(key)) {
                selectedNode.remove();
              }
            }
          }
        }
        removeText() {
          this.insertText("");
        }
        formatText(formatType) {
          const selectedNodes = this.getNodes();
          const selectedNodesLength = selectedNodes.length;
          const lastIndex = selectedNodesLength - 1;
          let firstNode = selectedNodes[0];
          let lastNode = selectedNodes[lastIndex];
          if (this.isCollapsed()) {
            this.toggleFormat(formatType);
            $setCompositionKey(null);
            return;
          }
          const anchor = this.anchor;
          const focus = this.focus;
          const firstNodeText = firstNode.getTextContent();
          const firstNodeTextLength = firstNodeText.length;
          const focusOffset = focus.offset;
          let firstNextFormat = 0;
          for (let i = 0; i < selectedNodes.length; i++) {
            const selectedNode = selectedNodes[i];
            if ($isTextNode(selectedNode)) {
              firstNextFormat = selectedNode.getFormatFlags(formatType, null);
              break;
            }
          }
          let anchorOffset = anchor.offset;
          let startOffset;
          let endOffset;
          const isBefore = anchor.isBefore(focus);
          startOffset = isBefore ? anchorOffset : focusOffset;
          endOffset = isBefore ? focusOffset : anchorOffset;
          if (startOffset === firstNode.getTextContentSize()) {
            const nextSibling = firstNode.getNextSibling();
            if ($isTextNode(nextSibling)) {
              anchorOffset = 0;
              startOffset = 0;
              firstNode = nextSibling;
              firstNextFormat = firstNode.getFormatFlags(formatType, null);
            }
          }
          if (firstNode.is(lastNode)) {
            if ($isTextNode(firstNode)) {
              if (anchor.type === "element" && focus.type === "element") {
                firstNode.setFormat(firstNextFormat);
                firstNode.select(startOffset, endOffset);
                this.format = firstNextFormat;
                return;
              }
              startOffset = anchorOffset > focusOffset ? focusOffset : anchorOffset;
              endOffset = anchorOffset > focusOffset ? anchorOffset : focusOffset;
              if (startOffset === endOffset) {
                return;
              }
              if (startOffset === 0 && endOffset === firstNodeTextLength) {
                firstNode.setFormat(firstNextFormat);
                firstNode.select(startOffset, endOffset);
              } else {
                const splitNodes = firstNode.splitText(startOffset, endOffset);
                const replacement = startOffset === 0 ? splitNodes[0] : splitNodes[1];
                replacement.setFormat(firstNextFormat);
                replacement.select(0, endOffset - startOffset);
              }
              this.format = firstNextFormat;
            }
          } else {
            if ($isTextNode(firstNode)) {
              if (startOffset !== 0) {
                [, firstNode] = firstNode.splitText(startOffset);
                startOffset = 0;
              }
              firstNode.setFormat(firstNextFormat);
            }
            let lastNextFormat = firstNextFormat;
            if ($isTextNode(lastNode)) {
              lastNextFormat = lastNode.getFormatFlags(formatType, firstNextFormat);
              const lastNodeText = lastNode.getTextContent();
              const lastNodeTextLength = lastNodeText.length;
              if (endOffset !== 0) {
                if (endOffset !== lastNodeTextLength) {
                  [lastNode] = lastNode.splitText(endOffset);
                }
                lastNode.setFormat(lastNextFormat);
              }
            }
            for (let i = 1; i < lastIndex; i++) {
              const selectedNode = selectedNodes[i];
              const selectedNodeKey = selectedNode.__key;
              if ($isTextNode(selectedNode) && selectedNodeKey !== firstNode.__key && selectedNodeKey !== lastNode.__key && !selectedNode.isToken()) {
                const selectedNextFormat = selectedNode.getFormatFlags(formatType, lastNextFormat);
                selectedNode.setFormat(selectedNextFormat);
              }
            }
          }
        }
        insertNodes(nodes, selectStart) {
          if (!this.isCollapsed()) {
            this.removeText();
          }
          const anchor = this.anchor;
          const anchorOffset = anchor.offset;
          const anchorNode = anchor.getNode();
          let target = anchorNode;
          if (anchor.type === "element") {
            const element = anchor.getNode();
            const placementNode = element.getChildAtIndex(anchorOffset - 1);
            if (placementNode === null) {
              target = element;
            } else {
              target = placementNode;
            }
          }
          const siblings = [];
          const nextSiblings = anchorNode.getNextSiblings();
          const topLevelElement = $isRootNode(anchorNode) ? null : anchorNode.getTopLevelElementOrThrow();
          if ($isTextNode(anchorNode)) {
            const textContent = anchorNode.getTextContent();
            const textContentLength = textContent.length;
            if (anchorOffset === 0 && textContentLength !== 0) {
              const prevSibling = anchorNode.getPreviousSibling();
              if (prevSibling !== null) {
                target = prevSibling;
              } else {
                target = anchorNode.getParentOrThrow();
              }
              siblings.push(anchorNode);
            } else if (anchorOffset === textContentLength) {
              target = anchorNode;
            } else if ($isTokenOrInert(anchorNode)) {
              return false;
            } else {
              let danglingText;
              [target, danglingText] = anchorNode.splitText(anchorOffset);
              siblings.push(danglingText);
            }
          }
          const startingNode = target;
          siblings.push(...nextSiblings);
          const firstNode = nodes[0];
          let didReplaceOrMerge = false;
          let lastNodeInserted = null;
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if ($isElementNode(node)) {
              if (node.is(firstNode)) {
                if ($isElementNode(target) && target.isEmpty() && target.canReplaceWith(node)) {
                  target.replace(node);
                  target = node;
                  didReplaceOrMerge = true;
                  continue;
                }
                const firstDescendant = node.getFirstDescendant();
                if ($isLeafNode(firstDescendant)) {
                  let element = firstDescendant.getParentOrThrow();
                  while (element.isInline()) {
                    element = element.getParentOrThrow();
                  }
                  const children = element.getChildren();
                  const childrenLength = children.length;
                  if ($isElementNode(target)) {
                    for (let s = 0; s < childrenLength; s++) {
                      lastNodeInserted = children[s];
                      target.append(lastNodeInserted);
                    }
                  } else {
                    for (let s = childrenLength - 1; s >= 0; s--) {
                      lastNodeInserted = children[s];
                      target.insertAfter(lastNodeInserted);
                    }
                    target = target.getParentOrThrow();
                  }
                  element.remove();
                  didReplaceOrMerge = true;
                  if (element.is(node)) {
                    continue;
                  }
                }
              }
              if ($isTextNode(target)) {
                if (topLevelElement === null) {
                  {
                    throw Error(`insertNode: topLevelElement is root node`);
                  }
                }
                target = topLevelElement;
              }
            } else if (didReplaceOrMerge && !$isDecoratorNode(node) && $isRootNode(target.getParent())) {
              {
                throw Error(`insertNodes: cannot insert a non-element into a root node`);
              }
            }
            didReplaceOrMerge = false;
            if ($isElementNode(target)) {
              lastNodeInserted = node;
              if ($isDecoratorNode(node) && node.isTopLevel()) {
                target = target.insertAfter(node);
              } else if (!$isElementNode(node)) {
                const firstChild = target.getFirstChild();
                if (firstChild !== null) {
                  firstChild.insertBefore(node);
                } else {
                  target.append(node);
                }
                target = node;
              } else {
                if (!node.canBeEmpty() && node.isEmpty()) {
                  continue;
                }
                if ($isRootNode(target)) {
                  const placementNode = target.getChildAtIndex(anchorOffset);
                  if (placementNode !== null) {
                    placementNode.insertBefore(node);
                  } else {
                    target.append(node);
                  }
                  target = node;
                } else {
                  target = target.insertAfter(node);
                }
              }
            } else if (!$isElementNode(node) || $isDecoratorNode(target) && target.isTopLevel()) {
              lastNodeInserted = node;
              target = target.insertAfter(node);
            } else {
              target = node.getParentOrThrow();
              i--;
              continue;
            }
          }
          if (selectStart) {
            if ($isTextNode(startingNode)) {
              startingNode.select();
            } else {
              const prevSibling = target.getPreviousSibling();
              if ($isTextNode(prevSibling)) {
                prevSibling.select();
              } else {
                const index = target.getIndexWithinParent();
                target.getParentOrThrow().select(index, index);
              }
            }
          }
          if ($isElementNode(target)) {
            const lastChild = $isTextNode(lastNodeInserted) ? lastNodeInserted : target.getLastDescendant();
            if (!selectStart) {
              if (lastChild === null) {
                target.select();
              } else if ($isTextNode(lastChild)) {
                lastChild.select();
              } else {
                lastChild.selectNext();
              }
            }
            if (siblings.length !== 0) {
              for (let i = siblings.length - 1; i >= 0; i--) {
                const sibling = siblings[i];
                const prevParent = sibling.getParentOrThrow();
                if ($isElementNode(target) && !$isElementNode(sibling)) {
                  target.append(sibling);
                  target = sibling;
                } else if (!$isElementNode(target) && !$isElementNode(sibling)) {
                  target.insertBefore(sibling);
                  target = sibling;
                } else {
                  if ($isElementNode(sibling) && !sibling.canInsertAfter(target)) {
                    const prevParentClone = prevParent.constructor.clone(prevParent);
                    if (!$isElementNode(prevParentClone)) {
                      {
                        throw Error(`insertNodes: cloned parent clone is not an element`);
                      }
                    }
                    prevParentClone.append(sibling);
                    target.insertAfter(prevParentClone);
                  } else {
                    target.insertAfter(sibling);
                  }
                }
                if (prevParent.isEmpty() && !prevParent.canBeEmpty()) {
                  prevParent.remove();
                }
              }
            }
          } else if (!selectStart) {
            if ($isTextNode(target)) {
              target.select();
            } else {
              const element = target.getParentOrThrow();
              const index = target.getIndexWithinParent() + 1;
              element.select(index, index);
            }
          }
          return true;
        }
        insertParagraph() {
          if (!this.isCollapsed()) {
            this.removeText();
          }
          const anchor = this.anchor;
          const anchorOffset = anchor.offset;
          let currentElement;
          let nodesToMove = [];
          if (anchor.type === "text") {
            const anchorNode = anchor.getNode();
            const textContent = anchorNode.getTextContent();
            const textContentLength = textContent.length;
            nodesToMove = anchorNode.getNextSiblings().reverse();
            currentElement = anchorNode.getParentOrThrow();
            if (anchorOffset === 0) {
              nodesToMove.push(anchorNode);
            } else if (anchorOffset !== textContentLength) {
              const [, splitNode] = anchorNode.splitText(anchorOffset);
              nodesToMove.push(splitNode);
            }
          } else {
            currentElement = anchor.getNode();
            if ($isRootNode(currentElement)) {
              const paragraph = $createParagraphNode();
              const child = currentElement.getChildAtIndex(anchorOffset);
              paragraph.select();
              if (child !== null) {
                child.insertBefore(paragraph);
              } else {
                currentElement.append(paragraph);
              }
              return;
            }
            nodesToMove = currentElement.getChildren().slice(anchorOffset).reverse();
          }
          const newElement = currentElement.insertNewAfter(this);
          if (newElement === null) {
            this.insertLineBreak();
          } else if ($isElementNode(newElement)) {
            const nodesToMoveLength = nodesToMove.length;
            if (anchorOffset === 0 && nodesToMoveLength > 0) {
              currentElement.insertBefore(newElement);
              return;
            }
            let firstChild = null;
            if (nodesToMoveLength !== 0) {
              for (let i = 0; i < nodesToMoveLength; i++) {
                const nodeToMove = nodesToMove[i];
                if (firstChild === null) {
                  newElement.append(nodeToMove);
                } else {
                  firstChild.insertBefore(nodeToMove);
                }
                firstChild = nodeToMove;
              }
            }
            if (!newElement.canBeEmpty() && newElement.getChildrenSize() === 0) {
              newElement.selectPrevious();
              newElement.remove();
            } else {
              newElement.selectStart();
            }
          }
        }
        insertLineBreak(selectStart) {
          const lineBreakNode = $createLineBreakNode();
          const anchor = this.anchor;
          if (anchor.type === "element") {
            const element = anchor.getNode();
            if ($isRootNode(element)) {
              this.insertParagraph();
            }
          }
          if (selectStart) {
            this.insertNodes([lineBreakNode], true);
          } else {
            if (this.insertNodes([lineBreakNode])) {
              lineBreakNode.selectNext(0, 0);
            }
          }
        }
        extract() {
          const selectedNodes = this.getNodes();
          const selectedNodesLength = selectedNodes.length;
          const lastIndex = selectedNodesLength - 1;
          const anchor = this.anchor;
          const focus = this.focus;
          let firstNode = selectedNodes[0];
          let lastNode = selectedNodes[lastIndex];
          const anchorOffset = anchor.getCharacterOffset();
          const focusOffset = focus.getCharacterOffset();
          if (selectedNodesLength === 0) {
            return [];
          } else if (selectedNodesLength === 1) {
            if ($isTextNode(firstNode)) {
              const startOffset = anchorOffset > focusOffset ? focusOffset : anchorOffset;
              const endOffset = anchorOffset > focusOffset ? anchorOffset : focusOffset;
              const splitNodes = firstNode.splitText(startOffset, endOffset);
              const node = startOffset === 0 ? splitNodes[0] : splitNodes[1];
              return node != null ? [node] : [];
            }
            return [firstNode];
          }
          const isBefore = anchor.isBefore(focus);
          if ($isTextNode(firstNode)) {
            const startOffset = isBefore ? anchorOffset : focusOffset;
            if (startOffset === firstNode.getTextContentSize()) {
              selectedNodes.shift();
            } else if (startOffset !== 0) {
              [, firstNode] = firstNode.splitText(startOffset);
              selectedNodes[0] = firstNode;
            }
          }
          if ($isTextNode(lastNode)) {
            const lastNodeText = lastNode.getTextContent();
            const lastNodeTextLength = lastNodeText.length;
            const endOffset = isBefore ? focusOffset : anchorOffset;
            if (endOffset === 0) {
              selectedNodes.pop();
            } else if (endOffset !== lastNodeTextLength) {
              [lastNode] = lastNode.splitText(endOffset);
              selectedNodes[lastIndex] = lastNode;
            }
          }
          return selectedNodes;
        }
        modify(alter, isBackward, granularity) {
          const focus = this.focus;
          const anchor = this.anchor;
          const collapse = alter === "move";
          const possibleNode = $getDecoratorNode(focus, isBackward);
          if ($isDecoratorNode(possibleNode) && !possibleNode.isIsolated()) {
            const sibling = isBackward ? possibleNode.getPreviousSibling() : possibleNode.getNextSibling();
            if (!$isTextNode(sibling)) {
              const parent = possibleNode.getParentOrThrow();
              let offset;
              let elementKey;
              if ($isElementNode(sibling)) {
                elementKey = sibling.__key;
                offset = isBackward ? sibling.getChildrenSize() : 0;
              } else {
                offset = possibleNode.getIndexWithinParent();
                elementKey = parent.__key;
                if (!isBackward) {
                  offset++;
                }
              }
              focus.set(elementKey, offset, "element");
              if (collapse) {
                anchor.set(elementKey, offset, "element");
              }
              return;
            }
          }
          const domSelection = getDOMSelection();
          $moveNativeSelection(domSelection, alter, isBackward ? "backward" : "forward", granularity);
          if (domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            this.applyDOMRange(range);
            if (!collapse && (domSelection.anchorNode !== range.startContainer || domSelection.anchorOffset !== range.startOffset)) {
              $swapPoints(this);
            }
          }
        }
        deleteCharacter(isBackward) {
          if (this.isCollapsed()) {
            const anchor = this.anchor;
            const focus = this.focus;
            let anchorNode = anchor.getNode();
            if (!isBackward && (anchor.type === "element" && anchor.offset === anchorNode.getChildrenSize() || anchor.type === "text" && anchor.offset === anchorNode.getTextContentSize())) {
              const nextSibling = anchorNode.getNextSibling() || anchorNode.getParentOrThrow().getNextSibling();
              if ($isElementNode(nextSibling) && !nextSibling.canExtractContents()) {
                return;
              }
            }
            this.modify("extend", isBackward, "character");
            if (!this.isCollapsed()) {
              const focusNode = focus.type === "text" ? focus.getNode() : null;
              anchorNode = anchor.type === "text" ? anchor.getNode() : null;
              if (focusNode !== null && focusNode.isSegmented()) {
                const offset = focus.offset;
                const textContentSize = focusNode.getTextContentSize();
                if (focusNode.is(anchorNode) || isBackward && offset !== textContentSize || !isBackward && offset !== 0) {
                  $removeSegment(focusNode, isBackward, offset);
                  return;
                }
              } else if (anchorNode !== null && anchorNode.isSegmented()) {
                const offset = anchor.offset;
                const textContentSize = anchorNode.getTextContentSize();
                if (anchorNode.is(focusNode) || isBackward && offset !== 0 || !isBackward && offset !== textContentSize) {
                  $removeSegment(anchorNode, isBackward, offset);
                  return;
                }
              }
              $updateCaretSelectionForUnicodeCharacter(this, isBackward);
            } else if (isBackward && anchor.offset === 0) {
              const element = anchor.type === "element" ? anchor.getNode() : anchor.getNode().getParentOrThrow();
              if (element.collapseAtStart(this)) {
                return;
              }
            }
          }
          this.removeText();
        }
        deleteLine(isBackward) {
          if (this.isCollapsed()) {
            this.modify("extend", isBackward, "lineboundary");
          }
          this.removeText();
        }
        deleteWord(isBackward) {
          if (this.isCollapsed()) {
            this.modify("extend", isBackward, "word");
          }
          this.removeText();
        }
      };
      function $isNodeSelection(x) {
        return x instanceof NodeSelection;
      }
      function $swapPoints(selection) {
        const focus = selection.focus;
        const anchor = selection.anchor;
        const anchorKey = anchor.key;
        const anchorOffset = anchor.offset;
        const anchorType = anchor.type;
        $setPointValues(anchor, focus.key, focus.offset, focus.type);
        $setPointValues(focus, anchorKey, anchorOffset, anchorType);
      }
      function $moveNativeSelection(domSelection, alter, direction, granularity) {
        domSelection.modify(alter, direction, granularity);
      }
      function $updateCaretSelectionForUnicodeCharacter(selection, isBackward) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const anchorNode = anchor.getNode();
        const focusNode = focus.getNode();
        if (anchorNode === focusNode && anchor.type === "text" && focus.type === "text") {
          const anchorOffset = anchor.offset;
          const focusOffset = focus.offset;
          const isBefore = anchorOffset < focusOffset;
          const startOffset = isBefore ? anchorOffset : focusOffset;
          const endOffset = isBefore ? focusOffset : anchorOffset;
          const characterOffset = endOffset - 1;
          if (startOffset !== characterOffset) {
            const text = anchorNode.getTextContent().slice(startOffset, endOffset);
            if (!doesContainGrapheme(text)) {
              if (isBackward) {
                focus.offset = characterOffset;
              } else {
                anchor.offset = characterOffset;
              }
            }
          }
        }
      }
      function $removeSegment(node, isBackward, offset) {
        const textNode = node;
        const textContent = textNode.getTextContent();
        const split = textContent.split(/\s/g);
        const splitLength = split.length;
        let segmentOffset = 0;
        let restoreOffset = 0;
        for (let i = 0; i < splitLength; i++) {
          const text = split[i];
          const isLast = i === splitLength - 1;
          restoreOffset = segmentOffset;
          segmentOffset += text.length;
          if (isBackward && segmentOffset === offset || segmentOffset > offset || isLast) {
            split.splice(i, 1);
            if (isLast) {
              restoreOffset = void 0;
            }
            break;
          }
        }
        const nextTextContent = split.join(" ");
        if (nextTextContent === "") {
          textNode.remove();
        } else {
          textNode.setTextContent(nextTextContent);
          textNode.select(restoreOffset, restoreOffset);
        }
      }
      function shouldResolveAncestor(resolvedElement, resolvedOffset, lastPoint) {
        const parent = resolvedElement.getParent();
        return lastPoint === null || parent === null || !parent.canBeEmpty() || parent !== lastPoint.getNode();
      }
      function internalResolveSelectionPoint(dom, offset, lastPoint) {
        let resolvedOffset = offset;
        let resolvedNode;
        if (dom.nodeType === DOM_ELEMENT_TYPE) {
          let moveSelectionToEnd = false;
          const childNodes = dom.childNodes;
          const childNodesLength = childNodes.length;
          if (resolvedOffset === childNodesLength) {
            moveSelectionToEnd = true;
            resolvedOffset = childNodesLength - 1;
          }
          const childDOM = childNodes[resolvedOffset];
          resolvedNode = getNodeFromDOM(childDOM);
          if ($isTextNode(resolvedNode)) {
            resolvedOffset = getTextNodeOffset(resolvedNode, moveSelectionToEnd);
          } else {
            let resolvedElement = getNodeFromDOM(dom);
            if (resolvedElement === null) {
              return null;
            }
            if ($isElementNode(resolvedElement)) {
              let child = resolvedElement.getChildAtIndex(resolvedOffset);
              if ($isElementNode(child) && shouldResolveAncestor(child, resolvedOffset, lastPoint)) {
                const descendant = moveSelectionToEnd ? child.getLastDescendant() : child.getFirstDescendant();
                if (descendant === null) {
                  resolvedElement = child;
                  resolvedOffset = 0;
                } else {
                  child = descendant;
                  resolvedElement = child.getParentOrThrow();
                }
              }
              if ($isTextNode(child)) {
                resolvedNode = child;
                resolvedElement = null;
                resolvedOffset = getTextNodeOffset(resolvedNode, moveSelectionToEnd);
              } else if (child !== resolvedElement && moveSelectionToEnd) {
                resolvedOffset++;
              }
            } else {
              const index = resolvedElement.getIndexWithinParent();
              if (offset === 0 && $isDecoratorNode(resolvedElement) && getNodeFromDOM(dom) === resolvedElement) {
                resolvedOffset = index;
              } else {
                resolvedOffset = index + 1;
              }
              resolvedElement = resolvedElement.getParentOrThrow();
            }
            if ($isElementNode(resolvedElement)) {
              return $createPoint(resolvedElement.__key, resolvedOffset, "element");
            }
          }
        } else {
          resolvedNode = getNodeFromDOM(dom);
        }
        if (!$isTextNode(resolvedNode)) {
          return null;
        }
        return $createPoint(resolvedNode.__key, resolvedOffset, "text");
      }
      function internalResolveSelectionPoints(anchorDOM, anchorOffset, focusDOM, focusOffset, editor2, lastSelection) {
        if (anchorDOM === null || focusDOM === null || !isSelectionWithinEditor(editor2, anchorDOM, focusDOM)) {
          return null;
        }
        const resolvedAnchorPoint = internalResolveSelectionPoint(anchorDOM, anchorOffset, $isRangeSelection(lastSelection) ? lastSelection.anchor : null);
        if (resolvedAnchorPoint === null) {
          return null;
        }
        const resolvedFocusPoint = internalResolveSelectionPoint(focusDOM, focusOffset, $isRangeSelection(lastSelection) ? lastSelection.focus : null);
        if (resolvedFocusPoint === null) {
          return null;
        }
        if (resolvedAnchorPoint.type === "text" && resolvedFocusPoint.type === "text") {
          const resolvedAnchorNode = resolvedAnchorPoint.getNode();
          const resolvedFocusNode = resolvedFocusPoint.getNode();
          const textContentSize = resolvedAnchorNode.getTextContentSize();
          const resolvedAnchorOffset = resolvedAnchorPoint.offset;
          const resolvedFocusOffset = resolvedFocusPoint.offset;
          if (resolvedAnchorNode === resolvedFocusNode && resolvedAnchorOffset === resolvedFocusOffset) {
            if (anchorOffset === 0) {
              const prevSibling = resolvedAnchorNode.getPreviousSibling();
              if ($isTextNode(prevSibling) && !prevSibling.isInert()) {
                const offset = prevSibling.getTextContentSize();
                const key = prevSibling.__key;
                resolvedAnchorPoint.key = key;
                resolvedFocusPoint.key = key;
                resolvedAnchorPoint.offset = offset;
                resolvedFocusPoint.offset = offset;
              }
            }
          } else {
            if (resolvedAnchorOffset === textContentSize) {
              const nextSibling = resolvedAnchorNode.getNextSibling();
              if ($isTextNode(nextSibling) && !nextSibling.isInert()) {
                resolvedAnchorPoint.key = nextSibling.__key;
                resolvedAnchorPoint.offset = 0;
              }
            }
          }
          if (editor2.isComposing() && editor2._compositionKey !== resolvedAnchorPoint.key && $isRangeSelection(lastSelection)) {
            const lastAnchor = lastSelection.anchor;
            const lastFocus = lastSelection.focus;
            $setPointValues(resolvedAnchorPoint, lastAnchor.key, lastAnchor.offset, lastAnchor.type);
            $setPointValues(resolvedFocusPoint, lastFocus.key, lastFocus.offset, lastFocus.type);
          }
        }
        return [resolvedAnchorPoint, resolvedFocusPoint];
      }
      function internalMakeRangeSelection(anchorKey, anchorOffset, focusKey, focusOffset, anchorType, focusType) {
        const editorState = getActiveEditorState();
        const selection = new RangeSelection($createPoint(anchorKey, anchorOffset, anchorType), $createPoint(focusKey, focusOffset, focusType), 0);
        selection.dirty = true;
        editorState._selection = selection;
        return selection;
      }
      function $createEmptyRangeSelection() {
        const anchor = $createPoint("root", 0, "element");
        const focus = $createPoint("root", 0, "element");
        return new RangeSelection(anchor, focus, 0);
      }
      function $createEmptyObjectSelection() {
        return new NodeSelection(/* @__PURE__ */ new Set());
      }
      function $createEmptyGridSelection() {
        return new GridSelection("root", "root", "root");
      }
      function getActiveEventType() {
        const event = window.event;
        return event && event.type;
      }
      function internalCreateSelection(editor2) {
        const currentEditorState = editor2.getEditorState();
        const lastSelection = currentEditorState._selection;
        const domSelection = getDOMSelection();
        if ($isNodeSelection(lastSelection) || $isGridSelection(lastSelection)) {
          return lastSelection.clone();
        }
        return internalCreateRangeSelection(lastSelection, domSelection, editor2);
      }
      function internalCreateRangeSelection(lastSelection, domSelection, editor2) {
        const eventType = getActiveEventType();
        const isSelectionChange = eventType === "selectionchange";
        const useDOMSelection = !getIsProcesssingMutations() && (isSelectionChange || eventType === "beforeinput" || eventType === "compositionstart" || eventType === "compositionend" || eventType === "click" && window.event.detail === 3 || eventType === void 0);
        let anchorDOM, focusDOM, anchorOffset, focusOffset;
        if (!$isRangeSelection(lastSelection) || useDOMSelection) {
          if (domSelection === null) {
            return null;
          }
          anchorDOM = domSelection.anchorNode;
          focusDOM = domSelection.focusNode;
          anchorOffset = domSelection.anchorOffset;
          focusOffset = domSelection.focusOffset;
        } else {
          return lastSelection.clone();
        }
        const resolvedSelectionPoints = internalResolveSelectionPoints(anchorDOM, anchorOffset, focusDOM, focusOffset, editor2, lastSelection);
        if (resolvedSelectionPoints === null) {
          return null;
        }
        const [resolvedAnchorPoint, resolvedFocusPoint] = resolvedSelectionPoints;
        return new RangeSelection(resolvedAnchorPoint, resolvedFocusPoint, !$isRangeSelection(lastSelection) ? 0 : lastSelection.format);
      }
      function $getSelection() {
        const editorState = getActiveEditorState();
        return editorState._selection;
      }
      function $getPreviousSelection() {
        const editor2 = getActiveEditor();
        return editor2._editorState._selection;
      }
      function internalCreateSelectionFromParse(parsedSelection) {
        if (parsedSelection !== null) {
          if (parsedSelection.type === "range") {
            return new RangeSelection($createPoint(parsedSelection.anchor.key, parsedSelection.anchor.offset, parsedSelection.anchor.type), $createPoint(parsedSelection.focus.key, parsedSelection.focus.offset, parsedSelection.focus.type), 0);
          } else if (parsedSelection.type === "node") {
            return new NodeSelection(new Set(parsedSelection.nodes));
          } else if (parsedSelection.type === "grid") {
            return new GridSelection(parsedSelection.gridKey, parsedSelection.anchorCellKey, parsedSelection.focusCellKey);
          }
        }
        return null;
      }
      function $updateElementSelectionOnCreateDeleteNode(selection, parentNode, nodeOffset, times = 1) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const anchorNode = anchor.getNode();
        const focusNode = focus.getNode();
        if (!parentNode.is(anchorNode) && !parentNode.is(focusNode)) {
          return;
        }
        const parentKey = parentNode.__key;
        if (selection.isCollapsed()) {
          const selectionOffset = anchor.offset;
          if (nodeOffset <= selectionOffset) {
            const newSelectionOffset = Math.max(0, selectionOffset + times);
            anchor.set(parentKey, newSelectionOffset, "element");
            focus.set(parentKey, newSelectionOffset, "element");
            $updateSelectionResolveTextNodes(selection);
          }
          return;
        }
        const isBackward = selection.isBackward();
        const firstPoint = isBackward ? focus : anchor;
        const firstPointNode = firstPoint.getNode();
        const lastPoint = isBackward ? anchor : focus;
        const lastPointNode = lastPoint.getNode();
        if (parentNode.is(firstPointNode)) {
          const firstPointOffset = firstPoint.offset;
          if (nodeOffset <= firstPointOffset) {
            firstPoint.set(parentKey, Math.max(0, firstPointOffset + times), "element");
          }
        }
        if (parentNode.is(lastPointNode)) {
          const lastPointOffset = lastPoint.offset;
          if (nodeOffset <= lastPointOffset) {
            lastPoint.set(parentKey, Math.max(0, lastPointOffset + times), "element");
          }
        }
        $updateSelectionResolveTextNodes(selection);
      }
      function $updateSelectionResolveTextNodes(selection) {
        const anchor = selection.anchor;
        const anchorOffset = anchor.offset;
        const focus = selection.focus;
        const focusOffset = focus.offset;
        const anchorNode = anchor.getNode();
        const focusNode = focus.getNode();
        if (selection.isCollapsed()) {
          if (!$isElementNode(anchorNode)) {
            return;
          }
          const childSize = anchorNode.getChildrenSize();
          const anchorOffsetAtEnd = anchorOffset >= childSize;
          const child = anchorOffsetAtEnd ? anchorNode.getChildAtIndex(childSize - 1) : anchorNode.getChildAtIndex(anchorOffset);
          if ($isTextNode(child)) {
            let newOffset = 0;
            if (anchorOffsetAtEnd) {
              newOffset = child.getTextContentSize();
            }
            anchor.set(child.__key, newOffset, "text");
            focus.set(child.__key, newOffset, "text");
          }
          return;
        }
        if ($isElementNode(anchorNode)) {
          const childSize = anchorNode.getChildrenSize();
          const anchorOffsetAtEnd = anchorOffset >= childSize;
          const child = anchorOffsetAtEnd ? anchorNode.getChildAtIndex(childSize - 1) : anchorNode.getChildAtIndex(anchorOffset);
          if ($isTextNode(child)) {
            let newOffset = 0;
            if (anchorOffsetAtEnd) {
              newOffset = child.getTextContentSize();
            }
            anchor.set(child.__key, newOffset, "text");
          }
        }
        if ($isElementNode(focusNode)) {
          const childSize = focusNode.getChildrenSize();
          const focusOffsetAtEnd = focusOffset >= childSize;
          const child = focusOffsetAtEnd ? focusNode.getChildAtIndex(childSize - 1) : focusNode.getChildAtIndex(focusOffset);
          if ($isTextNode(child)) {
            let newOffset = 0;
            if (focusOffsetAtEnd) {
              newOffset = child.getTextContentSize();
            }
            focus.set(child.__key, newOffset, "text");
          }
        }
      }
      function applySelectionTransforms(nextEditorState, editor2) {
        const prevEditorState = editor2.getEditorState();
        const prevSelection = prevEditorState._selection;
        const nextSelection = nextEditorState._selection;
        if ($isRangeSelection(nextSelection)) {
          const anchor = nextSelection.anchor;
          const focus = nextSelection.focus;
          let anchorNode;
          if (anchor.type === "text") {
            anchorNode = anchor.getNode();
            anchorNode.selectionTransform(prevSelection, nextSelection);
          }
          if (focus.type === "text") {
            const focusNode = focus.getNode();
            if (anchorNode !== focusNode) {
              focusNode.selectionTransform(prevSelection, nextSelection);
            }
          }
        }
      }
      function moveSelectionPointToSibling(point, node, parent, prevSibling, nextSibling) {
        let siblingKey = null;
        let offset = 0;
        let type = null;
        if (prevSibling !== null) {
          siblingKey = prevSibling.__key;
          if ($isTextNode(prevSibling)) {
            offset = prevSibling.getTextContentSize();
            type = "text";
          } else if ($isElementNode(prevSibling)) {
            offset = prevSibling.getChildrenSize();
            type = "element";
          }
        } else {
          if (nextSibling !== null) {
            siblingKey = nextSibling.__key;
            if ($isTextNode(nextSibling)) {
              type = "text";
            } else if ($isElementNode(nextSibling)) {
              type = "element";
            }
          }
        }
        if (siblingKey !== null && type !== null) {
          point.set(siblingKey, offset, type);
        } else {
          offset = node.getIndexWithinParent();
          if (offset === -1) {
            offset = parent.getChildrenSize();
          }
          point.set(parent.__key, offset, "element");
        }
      }
      function adjustPointOffsetForMergedSibling(point, isBefore, key, target, textLength) {
        if (point.type === "text") {
          point.key = key;
          if (!isBefore) {
            point.offset += textLength;
          }
        } else if (point.offset > target.getIndexWithinParent()) {
          point.offset -= 1;
        }
      }
      function removeNode(nodeToRemove, restoreSelection) {
        errorOnReadOnly();
        const key = nodeToRemove.__key;
        const parent = nodeToRemove.getParent();
        if (parent === null) {
          return;
        }
        const selection = $getSelection();
        let selectionMoved = false;
        if ($isRangeSelection(selection) && restoreSelection) {
          const anchor = selection.anchor;
          const focus = selection.focus;
          if (anchor.key === key) {
            moveSelectionPointToSibling(anchor, nodeToRemove, parent, nodeToRemove.getPreviousSibling(), nodeToRemove.getNextSibling());
            selectionMoved = true;
          }
          if (focus.key === key) {
            moveSelectionPointToSibling(focus, nodeToRemove, parent, nodeToRemove.getPreviousSibling(), nodeToRemove.getNextSibling());
            selectionMoved = true;
          }
        }
        const writableParent = parent.getWritable();
        const parentChildren = writableParent.__children;
        const index = parentChildren.indexOf(key);
        if (index === -1) {
          {
            throw Error(`Node is not a child of its parent`);
          }
        }
        internalMarkSiblingsAsDirty(nodeToRemove);
        parentChildren.splice(index, 1);
        const writableNodeToRemove = nodeToRemove.getWritable();
        writableNodeToRemove.__parent = null;
        if ($isRangeSelection(selection) && restoreSelection && !selectionMoved) {
          $updateElementSelectionOnCreateDeleteNode(selection, parent, index, -1);
        }
        if (parent !== null && !$isRootNode(parent) && !parent.canBeEmpty() && parent.isEmpty()) {
          removeNode(parent, restoreSelection);
        }
        if (parent !== null && $isRootNode(parent) && parent.isEmpty()) {
          parent.selectEnd();
        }
      }
      function $getNodeByKeyOrThrow(key) {
        const node = $getNodeByKey(key);
        if (node === null) {
          {
            throw Error(`Expected node with key ${key} to exist but it's not in the nodeMap.`);
          }
        }
        return node;
      }
      var LexicalNode = class {
        static getType() {
          {
            throw Error(`LexicalNode: Node ${this.name} does not implement .getType().`);
          }
        }
        static clone(data) {
          {
            throw Error(`LexicalNode: Node ${this.name} does not implement .clone().`);
          }
        }
        constructor(key) {
          this.__type = this.constructor.getType();
          this.__parent = null;
          $setNodeKey(this, key);
          {
            const proto = Object.getPrototypeOf(this);
            ["getType", "clone"].forEach((method) => {
              if (!proto.constructor.hasOwnProperty(method)) {
                console.warn(`${this.constructor.name} must implement static "${method}" method`);
              }
            });
            if (this.__type !== "root") {
              errorOnReadOnly();
              errorOnTypeKlassMismatch(this.__type, this.constructor);
            }
          }
        }
        getType() {
          return this.__type;
        }
        isAttached() {
          let nodeKey = this.__key;
          while (nodeKey !== null) {
            if (nodeKey === "root") {
              return true;
            }
            const node = $getNodeByKey(nodeKey);
            if (node === null) {
              break;
            }
            nodeKey = node.__parent;
          }
          return false;
        }
        isSelected() {
          const selection = $getSelection();
          if (selection == null) {
            return false;
          }
          const selectedNodeKeys = new Set(selection.getNodes().map((n) => n.__key));
          const isSelected = selectedNodeKeys.has(this.__key);
          if ($isTextNode(this)) {
            return isSelected;
          }
          if ($isRangeSelection(selection) && selection.anchor.type === "element" && selection.focus.type === "element" && selection.anchor.key === selection.focus.key && selection.anchor.offset === selection.focus.offset) {
            return false;
          }
          return isSelected;
        }
        getKey() {
          return this.__key;
        }
        getIndexWithinParent() {
          const parent = this.getParent();
          if (parent === null) {
            return -1;
          }
          const children = parent.__children;
          return children.indexOf(this.__key);
        }
        getParent() {
          const parent = this.getLatest().__parent;
          if (parent === null) {
            return null;
          }
          return $getNodeByKey(parent);
        }
        getParentOrThrow() {
          const parent = this.getParent();
          if (parent === null) {
            {
              throw Error(`Expected node ${this.__key} to have a parent.`);
            }
          }
          return parent;
        }
        getTopLevelElement() {
          let node = this;
          while (node !== null) {
            const parent = node.getParent();
            if ($isRootNode(parent) && $isElementNode(node)) {
              return node;
            }
            node = parent;
          }
          return null;
        }
        getTopLevelElementOrThrow() {
          const parent = this.getTopLevelElement();
          if (parent === null) {
            {
              throw Error(`Expected node ${this.__key} to have a top parent element.`);
            }
          }
          return parent;
        }
        getParents() {
          const parents = [];
          let node = this.getParent();
          while (node !== null) {
            parents.push(node);
            node = node.getParent();
          }
          return parents;
        }
        getParentKeys() {
          const parents = [];
          let node = this.getParent();
          while (node !== null) {
            parents.push(node.__key);
            node = node.getParent();
          }
          return parents;
        }
        getPreviousSibling() {
          const parent = this.getParent();
          if (parent === null) {
            return null;
          }
          const children = parent.__children;
          const index = children.indexOf(this.__key);
          if (index <= 0) {
            return null;
          }
          return $getNodeByKey(children[index - 1]);
        }
        getPreviousSiblings() {
          const parent = this.getParent();
          if (parent === null) {
            return [];
          }
          const children = parent.__children;
          const index = children.indexOf(this.__key);
          return children.slice(0, index).map((childKey) => $getNodeByKeyOrThrow(childKey));
        }
        getNextSibling() {
          const parent = this.getParent();
          if (parent === null) {
            return null;
          }
          const children = parent.__children;
          const childrenLength = children.length;
          const index = children.indexOf(this.__key);
          if (index >= childrenLength - 1) {
            return null;
          }
          return $getNodeByKey(children[index + 1]);
        }
        getNextSiblings() {
          const parent = this.getParent();
          if (parent === null) {
            return [];
          }
          const children = parent.__children;
          const index = children.indexOf(this.__key);
          return children.slice(index + 1).map((childKey) => $getNodeByKeyOrThrow(childKey));
        }
        getCommonAncestor(node) {
          const a = this.getParents();
          const b = node.getParents();
          if ($isElementNode(this)) {
            a.unshift(this);
          }
          if ($isElementNode(node)) {
            b.unshift(node);
          }
          const aLength = a.length;
          const bLength = b.length;
          if (aLength === 0 || bLength === 0 || a[aLength - 1] !== b[bLength - 1]) {
            return null;
          }
          const bSet = new Set(b);
          for (let i = 0; i < aLength; i++) {
            const ancestor = a[i];
            if (bSet.has(ancestor)) {
              return ancestor;
            }
          }
          return null;
        }
        is(object) {
          if (object == null) {
            return false;
          }
          return this.__key === object.__key;
        }
        isBefore(targetNode) {
          if (targetNode.isParentOf(this)) {
            return true;
          }
          if (this.isParentOf(targetNode)) {
            return false;
          }
          const commonAncestor = this.getCommonAncestor(targetNode);
          let indexA = 0;
          let indexB = 0;
          let node = this;
          while (true) {
            const parent = node.getParentOrThrow();
            if (parent === commonAncestor) {
              indexA = parent.__children.indexOf(node.__key);
              break;
            }
            node = parent;
          }
          node = targetNode;
          while (true) {
            const parent = node.getParentOrThrow();
            if (parent === commonAncestor) {
              indexB = parent.__children.indexOf(node.__key);
              break;
            }
            node = parent;
          }
          return indexA < indexB;
        }
        isParentOf(targetNode) {
          const key = this.__key;
          if (key === targetNode.__key) {
            return false;
          }
          let node = targetNode;
          while (node !== null) {
            if (node.__key === key) {
              return true;
            }
            node = node.getParent();
          }
          return false;
        }
        getNodesBetween(targetNode) {
          const isBefore = this.isBefore(targetNode);
          const nodes = [];
          const visited = /* @__PURE__ */ new Set();
          let node = this;
          let dfsAncestor = null;
          while (true) {
            const key = node.__key;
            if (!visited.has(key)) {
              visited.add(key);
              nodes.push(node);
            }
            if (node === targetNode) {
              break;
            }
            const child = $isElementNode(node) ? isBefore ? node.getFirstChild() : node.getLastChild() : null;
            if (child !== null) {
              if (dfsAncestor === null) {
                dfsAncestor = node;
              }
              node = child;
              continue;
            }
            const nextSibling = isBefore ? node.getNextSibling() : node.getPreviousSibling();
            if (nextSibling !== null) {
              node = nextSibling;
              continue;
            }
            const parent = node.getParentOrThrow();
            if (!visited.has(parent.__key)) {
              nodes.push(parent);
            }
            if (parent === targetNode) {
              break;
            }
            let parentSibling = null;
            let ancestor = parent;
            if (parent.is(dfsAncestor)) {
              dfsAncestor = null;
            }
            do {
              if (ancestor === null) {
                {
                  throw Error(`getNodesBetween: ancestor is null`);
                }
              }
              parentSibling = isBefore ? ancestor.getNextSibling() : ancestor.getPreviousSibling();
              ancestor = ancestor.getParent();
              if (ancestor !== null) {
                if (ancestor.is(dfsAncestor)) {
                  dfsAncestor = null;
                }
                if (parentSibling === null && !visited.has(ancestor.__key)) {
                  nodes.push(ancestor);
                }
              }
            } while (parentSibling === null);
            node = parentSibling;
          }
          if (!isBefore) {
            nodes.reverse();
          }
          return nodes;
        }
        isDirty() {
          const editor2 = getActiveEditor();
          const dirtyLeaves = editor2._dirtyLeaves;
          return dirtyLeaves !== null && dirtyLeaves.has(this.__key);
        }
        isComposing() {
          return this.__key === $getCompositionKey();
        }
        getLatest() {
          const latest = $getNodeByKey(this.__key);
          if (latest === null) {
            {
              throw Error(`getLatest: node not found`);
            }
          }
          return latest;
        }
        getWritable() {
          errorOnReadOnly();
          const editorState = getActiveEditorState();
          const editor2 = getActiveEditor();
          const nodeMap = editorState._nodeMap;
          const key = this.__key;
          const latestNode = this.getLatest();
          const parent = latestNode.__parent;
          const cloneNotNeeded = editor2._cloneNotNeeded;
          if (cloneNotNeeded.has(key)) {
            internalMarkNodeAsDirty(latestNode);
            return latestNode;
          }
          const constructor = latestNode.constructor;
          const mutableNode = constructor.clone(latestNode);
          mutableNode.__parent = parent;
          if ($isElementNode(latestNode) && $isElementNode(mutableNode)) {
            mutableNode.__children = Array.from(latestNode.__children);
            mutableNode.__indent = latestNode.__indent;
            mutableNode.__format = latestNode.__format;
            mutableNode.__dir = latestNode.__dir;
          } else if ($isTextNode(latestNode) && $isTextNode(mutableNode)) {
            mutableNode.__format = latestNode.__format;
            mutableNode.__style = latestNode.__style;
            mutableNode.__mode = latestNode.__mode;
            mutableNode.__detail = latestNode.__detail;
          }
          cloneNotNeeded.add(key);
          mutableNode.__key = key;
          internalMarkNodeAsDirty(mutableNode);
          nodeMap.set(key, mutableNode);
          return mutableNode;
        }
        getTextContent(includeInert, includeDirectionless) {
          return "";
        }
        getTextContentSize(includeInert, includeDirectionless) {
          return this.getTextContent(includeInert, includeDirectionless).length;
        }
        createDOM(config, editor2) {
          {
            throw Error(`createDOM: base method not extended`);
          }
        }
        updateDOM(prevNode, dom, config) {
          {
            throw Error(`updateDOM: base method not extended`);
          }
        }
        exportDOM(editor2) {
          if ($isDecoratorNode(this)) {
            const element2 = editor2.getElementByKey(this.getKey());
            return {
              element: element2 ? element2.cloneNode() : null
            };
          }
          const element = this.createDOM(editor2._config, editor2);
          return {
            element
          };
        }
        static importDOM() {
          return null;
        }
        remove() {
          errorOnReadOnly();
          removeNode(this, true);
        }
        replace(replaceWith) {
          errorOnReadOnly();
          const toReplaceKey = this.__key;
          const writableReplaceWith = replaceWith.getWritable();
          removeFromParent(writableReplaceWith);
          const newParent = this.getParentOrThrow();
          const writableParent = newParent.getWritable();
          const children = writableParent.__children;
          const index = children.indexOf(this.__key);
          const newKey = writableReplaceWith.__key;
          if (index === -1) {
            {
              throw Error(`Node is not a child of its parent`);
            }
          }
          children.splice(index, 0, newKey);
          writableReplaceWith.__parent = newParent.__key;
          removeNode(this, false);
          internalMarkSiblingsAsDirty(writableReplaceWith);
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchor = selection.anchor;
            const focus = selection.focus;
            if (anchor.key === toReplaceKey) {
              $moveSelectionPointToEnd(anchor, writableReplaceWith);
            }
            if (focus.key === toReplaceKey) {
              $moveSelectionPointToEnd(focus, writableReplaceWith);
            }
          }
          if ($getCompositionKey() === toReplaceKey) {
            $setCompositionKey(newKey);
          }
          return writableReplaceWith;
        }
        insertAfter(nodeToInsert) {
          errorOnReadOnly();
          const writableSelf = this.getWritable();
          const writableNodeToInsert = nodeToInsert.getWritable();
          const oldParent = writableNodeToInsert.getParent();
          const selection = $getSelection();
          const oldIndex = nodeToInsert.getIndexWithinParent();
          let elementAnchorSelectionOnNode = false;
          let elementFocusSelectionOnNode = false;
          if (oldParent !== null) {
            removeFromParent(writableNodeToInsert);
            if ($isRangeSelection(selection)) {
              const oldParentKey = oldParent.__key;
              const anchor = selection.anchor;
              const focus = selection.focus;
              elementAnchorSelectionOnNode = anchor.type === "element" && anchor.key === oldParentKey && anchor.offset === oldIndex + 1;
              elementFocusSelectionOnNode = focus.type === "element" && focus.key === oldParentKey && focus.offset === oldIndex + 1;
            }
          }
          const writableParent = this.getParentOrThrow().getWritable();
          const insertKey = writableNodeToInsert.__key;
          writableNodeToInsert.__parent = writableSelf.__parent;
          const children = writableParent.__children;
          const index = children.indexOf(writableSelf.__key);
          if (index === -1) {
            {
              throw Error(`Node is not a child of its parent`);
            }
          }
          children.splice(index + 1, 0, insertKey);
          internalMarkSiblingsAsDirty(writableNodeToInsert);
          if ($isRangeSelection(selection)) {
            $updateElementSelectionOnCreateDeleteNode(selection, writableParent, index + 1);
            const writableParentKey = writableParent.__key;
            if (elementAnchorSelectionOnNode) {
              selection.anchor.set(writableParentKey, index + 2, "element");
            }
            if (elementFocusSelectionOnNode) {
              selection.focus.set(writableParentKey, index + 2, "element");
            }
          }
          return nodeToInsert;
        }
        insertBefore(nodeToInsert) {
          errorOnReadOnly();
          const writableSelf = this.getWritable();
          const writableNodeToInsert = nodeToInsert.getWritable();
          removeFromParent(writableNodeToInsert);
          const writableParent = this.getParentOrThrow().getWritable();
          const insertKey = writableNodeToInsert.__key;
          writableNodeToInsert.__parent = writableSelf.__parent;
          const children = writableParent.__children;
          const index = children.indexOf(writableSelf.__key);
          if (index === -1) {
            {
              throw Error(`Node is not a child of its parent`);
            }
          }
          children.splice(index, 0, insertKey);
          internalMarkSiblingsAsDirty(writableNodeToInsert);
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $updateElementSelectionOnCreateDeleteNode(selection, writableParent, index);
          }
          return nodeToInsert;
        }
        selectPrevious(anchorOffset, focusOffset) {
          errorOnReadOnly();
          const prevSibling = this.getPreviousSibling();
          const parent = this.getParentOrThrow();
          if (prevSibling === null) {
            return parent.select(0, 0);
          }
          if ($isElementNode(prevSibling)) {
            return prevSibling.select();
          } else if (!$isTextNode(prevSibling)) {
            const index = prevSibling.getIndexWithinParent() + 1;
            return parent.select(index, index);
          }
          return prevSibling.select(anchorOffset, focusOffset);
        }
        selectNext(anchorOffset, focusOffset) {
          errorOnReadOnly();
          const nextSibling = this.getNextSibling();
          const parent = this.getParentOrThrow();
          if (nextSibling === null) {
            return parent.select();
          }
          if ($isElementNode(nextSibling)) {
            return nextSibling.select(0, 0);
          } else if (!$isTextNode(nextSibling)) {
            const index = nextSibling.getIndexWithinParent();
            return parent.select(index, index);
          }
          return nextSibling.select(anchorOffset, focusOffset);
        }
        markDirty() {
          this.getWritable();
        }
      };
      function errorOnTypeKlassMismatch(type, klass) {
        const registeredNode = getActiveEditor()._nodes.get(type);
        if (registeredNode === void 0) {
          {
            throw Error(`Create node: Attempted to create node ${klass.name} that was not previously registered on the editor. You can use register your custom nodes.`);
          }
        }
        const editorKlass = registeredNode.klass;
        if (editorKlass !== klass) {
          {
            throw Error(`Create node: Type ${type} in node ${klass.name} does not match registered node ${editorKlass.name} with the same type`);
          }
        }
      }
      var DecoratorNode = class extends LexicalNode {
        constructor(key) {
          super(key);
          {
            const proto = Object.getPrototypeOf(this);
            ["decorate"].forEach((method) => {
              if (!proto.hasOwnProperty(method)) {
                console.warn(`${this.constructor.name} must implement "${method}" method`);
              }
            });
          }
        }
        decorate(editor2) {
          {
            throw Error(`decorate: base method not extended`);
          }
        }
        isIsolated() {
          return false;
        }
        isTopLevel() {
          return false;
        }
      };
      function $isDecoratorNode(node) {
        return node instanceof DecoratorNode;
      }
      var ElementNode = class extends LexicalNode {
        constructor(key) {
          super(key);
          this.__children = [];
          this.__format = 0;
          this.__indent = 0;
          this.__dir = null;
        }
        getFormat() {
          const self = this.getLatest();
          return self.__format;
        }
        getIndent() {
          const self = this.getLatest();
          return self.__indent;
        }
        getChildren() {
          const self = this.getLatest();
          const children = self.__children;
          const childrenNodes = [];
          for (let i = 0; i < children.length; i++) {
            const childNode = $getNodeByKey(children[i]);
            if (childNode !== null) {
              childrenNodes.push(childNode);
            }
          }
          return childrenNodes;
        }
        getChildrenKeys() {
          return this.getLatest().__children;
        }
        getChildrenSize() {
          const self = this.getLatest();
          return self.__children.length;
        }
        isEmpty() {
          return this.getChildrenSize() === 0;
        }
        isDirty() {
          const editor2 = getActiveEditor();
          const dirtyElements = editor2._dirtyElements;
          return dirtyElements !== null && dirtyElements.has(this.__key);
        }
        getAllTextNodes(includeInert) {
          const textNodes = [];
          const self = this.getLatest();
          const children = self.__children;
          for (let i = 0; i < children.length; i++) {
            const childNode = $getNodeByKey(children[i]);
            if ($isTextNode(childNode) && (includeInert || !childNode.isInert())) {
              textNodes.push(childNode);
            } else if ($isElementNode(childNode)) {
              const subChildrenNodes = childNode.getAllTextNodes(includeInert);
              textNodes.push(...subChildrenNodes);
            }
          }
          return textNodes;
        }
        getFirstDescendant() {
          let node = this.getFirstChild();
          while (node !== null) {
            if ($isElementNode(node)) {
              const child = node.getFirstChild();
              if (child !== null) {
                node = child;
                continue;
              }
            }
            break;
          }
          return node;
        }
        getLastDescendant() {
          let node = this.getLastChild();
          while (node !== null) {
            if ($isElementNode(node)) {
              const child = node.getLastChild();
              if (child !== null) {
                node = child;
                continue;
              }
            }
            break;
          }
          return node;
        }
        getDescendantByIndex(index) {
          const children = this.getChildren();
          const childrenLength = children.length;
          if (childrenLength === 0) {
            return this;
          }
          if (index >= childrenLength) {
            const resolvedNode2 = children[childrenLength - 1];
            return $isElementNode(resolvedNode2) && resolvedNode2.getLastDescendant() || resolvedNode2;
          }
          const resolvedNode = children[index];
          return $isElementNode(resolvedNode) && resolvedNode.getFirstDescendant() || resolvedNode;
        }
        getFirstChild() {
          const self = this.getLatest();
          const children = self.__children;
          const childrenLength = children.length;
          if (childrenLength === 0) {
            return null;
          }
          return $getNodeByKey(children[0]);
        }
        getFirstChildOrThrow() {
          const firstChild = this.getFirstChild();
          if (firstChild === null) {
            {
              throw Error(`Expected node ${this.__key} to have a first child.`);
            }
          }
          return firstChild;
        }
        getLastChild() {
          const self = this.getLatest();
          const children = self.__children;
          const childrenLength = children.length;
          if (childrenLength === 0) {
            return null;
          }
          return $getNodeByKey(children[childrenLength - 1]);
        }
        getChildAtIndex(index) {
          const self = this.getLatest();
          const children = self.__children;
          const key = children[index];
          if (key === void 0) {
            return null;
          }
          return $getNodeByKey(key);
        }
        getTextContent(includeInert, includeDirectionless) {
          let textContent = "";
          const children = this.getChildren();
          const childrenLength = children.length;
          for (let i = 0; i < childrenLength; i++) {
            const child = children[i];
            textContent += child.getTextContent(includeInert, includeDirectionless);
            if ($isElementNode(child) && i !== childrenLength - 1 && !child.isInline()) {
              textContent += "\n\n";
            }
          }
          return textContent;
        }
        getDirection() {
          const self = this.getLatest();
          return self.__dir;
        }
        hasFormat(type) {
          const formatFlag = ELEMENT_TYPE_TO_FORMAT[type];
          return (this.getFormat() & formatFlag) !== 0;
        }
        select(_anchorOffset, _focusOffset) {
          errorOnReadOnly();
          const selection = $getSelection();
          let anchorOffset = _anchorOffset;
          let focusOffset = _focusOffset;
          const childrenCount = this.getChildrenSize();
          if (anchorOffset === void 0) {
            anchorOffset = childrenCount;
          }
          if (focusOffset === void 0) {
            focusOffset = childrenCount;
          }
          const key = this.__key;
          if (!$isRangeSelection(selection)) {
            return internalMakeRangeSelection(key, anchorOffset, key, focusOffset, "element", "element");
          } else {
            selection.anchor.set(key, anchorOffset, "element");
            selection.focus.set(key, focusOffset, "element");
            selection.dirty = true;
          }
          return selection;
        }
        selectStart() {
          const firstNode = this.getFirstDescendant();
          if ($isElementNode(firstNode) || $isTextNode(firstNode)) {
            return firstNode.select(0, 0);
          }
          if (firstNode !== null) {
            return firstNode.selectPrevious();
          }
          return this.select(0, 0);
        }
        selectEnd() {
          const lastNode = this.getLastDescendant();
          if ($isElementNode(lastNode) || $isTextNode(lastNode)) {
            return lastNode.select();
          }
          if (lastNode !== null) {
            return lastNode.selectNext();
          }
          return this.select();
        }
        clear() {
          errorOnReadOnly();
          const writableSelf = this.getWritable();
          const children = this.getChildren();
          children.forEach((child) => child.remove());
          return writableSelf;
        }
        append(...nodesToAppend) {
          errorOnReadOnly();
          return this.splice(this.getChildrenSize(), 0, nodesToAppend);
        }
        setDirection(direction) {
          errorOnReadOnly();
          const self = this.getWritable();
          self.__dir = direction;
          return self;
        }
        setFormat(type) {
          errorOnReadOnly();
          const self = this.getWritable();
          self.__format = ELEMENT_TYPE_TO_FORMAT[type];
          return this;
        }
        setIndent(indentLevel) {
          errorOnReadOnly();
          const self = this.getWritable();
          self.__indent = indentLevel;
          return this;
        }
        splice(start, deleteCount, nodesToInsert) {
          errorOnReadOnly();
          const writableSelf = this.getWritable();
          const writableSelfKey = writableSelf.__key;
          const writableSelfChildren = writableSelf.__children;
          const nodesToInsertLength = nodesToInsert.length;
          const nodesToInsertKeys = [];
          for (let i = 0; i < nodesToInsertLength; i++) {
            const nodeToInsert = nodesToInsert[i];
            const writableNodeToInsert = nodeToInsert.getWritable();
            if (nodeToInsert.__key === writableSelfKey) {
              {
                throw Error(`append: attemtping to append self`);
              }
            }
            removeFromParent(writableNodeToInsert);
            writableNodeToInsert.__parent = writableSelfKey;
            const newKey = writableNodeToInsert.__key;
            nodesToInsertKeys.push(newKey);
          }
          const nodeBeforeRange = this.getChildAtIndex(start - 1);
          if (nodeBeforeRange) {
            internalMarkNodeAsDirty(nodeBeforeRange);
          }
          const nodeAfterRange = this.getChildAtIndex(start + deleteCount);
          if (nodeAfterRange) {
            internalMarkNodeAsDirty(nodeAfterRange);
          }
          let nodesToRemoveKeys;
          if (start === writableSelfChildren.length) {
            writableSelfChildren.push(...nodesToInsertKeys);
            nodesToRemoveKeys = [];
          } else {
            nodesToRemoveKeys = writableSelfChildren.splice(start, deleteCount, ...nodesToInsertKeys);
          }
          if (nodesToRemoveKeys.length) {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const nodesToRemoveKeySet = new Set(nodesToRemoveKeys);
              const nodesToInsertKeySet = new Set(nodesToInsertKeys);
              const isPointRemoved = (point) => {
                let node = point.getNode();
                while (node) {
                  const nodeKey = node.__key;
                  if (nodesToRemoveKeySet.has(nodeKey) && !nodesToInsertKeySet.has(nodeKey)) {
                    return true;
                  }
                  node = node.getParent();
                }
                return false;
              };
              const {
                anchor,
                focus
              } = selection;
              if (isPointRemoved(anchor)) {
                moveSelectionPointToSibling(anchor, anchor.getNode(), this, nodeBeforeRange, nodeAfterRange);
              }
              if (isPointRemoved(focus)) {
                moveSelectionPointToSibling(focus, focus.getNode(), this, nodeBeforeRange, nodeAfterRange);
              }
              const nodesToRemoveKeysLength = nodesToRemoveKeys.length;
              for (let i = 0; i < nodesToRemoveKeysLength; i++) {
                const nodeToRemove = $getNodeByKey(nodesToRemoveKeys[i]);
                if (nodeToRemove != null) {
                  const writableNodeToRemove = nodeToRemove.getWritable();
                  writableNodeToRemove.__parent = null;
                }
              }
              if (writableSelfChildren.length === 0 && !this.canBeEmpty() && !$isRootNode(this)) {
                this.remove();
              }
            }
          }
          return writableSelf;
        }
        insertNewAfter(selection) {
          return null;
        }
        canInsertTab() {
          return false;
        }
        collapseAtStart(selection) {
          return false;
        }
        excludeFromCopy() {
          return false;
        }
        canExtractContents() {
          return true;
        }
        canReplaceWith(replacement) {
          return true;
        }
        canInsertAfter(node) {
          return true;
        }
        canBeEmpty() {
          return true;
        }
        canInsertTextBefore() {
          return true;
        }
        canInsertTextAfter() {
          return true;
        }
        isInline() {
          return false;
        }
        canMergeWith(node) {
          return false;
        }
      };
      function $isElementNode(node) {
        return node instanceof ElementNode;
      }
      var RootNode = class extends ElementNode {
        static getType() {
          return "root";
        }
        static clone() {
          return new RootNode();
        }
        constructor() {
          super("root");
          this.__cachedText = null;
        }
        getTopLevelElementOrThrow() {
          {
            throw Error(`getTopLevelElementOrThrow: root nodes are not top level elements`);
          }
        }
        getTextContent(includeInert, includeDirectionless) {
          const cachedText = this.__cachedText;
          if (isCurrentlyReadOnlyMode() || getActiveEditor()._dirtyType === NO_DIRTY_NODES) {
            if (cachedText !== null && (!includeInert || includeDirectionless !== false)) {
              return cachedText;
            }
          }
          return super.getTextContent(includeInert, includeDirectionless);
        }
        remove() {
          {
            throw Error(`remove: cannot be called on root nodes`);
          }
        }
        replace(node) {
          {
            throw Error(`replace: cannot be called on root nodes`);
          }
        }
        insertBefore(nodeToInsert) {
          {
            throw Error(`insertBefore: cannot be called on root nodes`);
          }
        }
        insertAfter(node) {
          {
            throw Error(`insertAfter: cannot be called on root nodes`);
          }
        }
        updateDOM(prevNode, dom) {
          return false;
        }
        append(...nodesToAppend) {
          for (let i = 0; i < nodesToAppend.length; i++) {
            const node = nodesToAppend[i];
            if (!$isElementNode(node) && !$isDecoratorNode(node)) {
              {
                throw Error(`rootNode.append: Only element or decorator nodes can be appended to the root node`);
              }
            }
          }
          return super.append(...nodesToAppend);
        }
        toJSON() {
          return {
            __children: this.__children,
            __dir: this.__dir,
            __format: this.__format,
            __indent: this.__indent,
            __key: "root",
            __parent: null,
            __type: "root"
          };
        }
      };
      function $createRootNode() {
        return new RootNode();
      }
      function $isRootNode(node) {
        return node instanceof RootNode;
      }
      function editorStateHasDirtySelection(editorState, editor2) {
        const currentSelection = editor2.getEditorState()._selection;
        const pendingSelection = editorState._selection;
        if (pendingSelection !== null) {
          if (pendingSelection.dirty || !pendingSelection.is(currentSelection)) {
            return true;
          }
        } else if (currentSelection !== null) {
          return true;
        }
        return false;
      }
      function cloneEditorState(current) {
        return new EditorState(new Map(current._nodeMap));
      }
      function createEmptyEditorState() {
        return new EditorState(/* @__PURE__ */ new Map([["root", $createRootNode()]]));
      }
      var EditorState = class {
        constructor(nodeMap, selection) {
          this._nodeMap = nodeMap;
          this._selection = selection || null;
          this._flushSync = false;
          this._readOnly = false;
        }
        isEmpty() {
          return this._nodeMap.size === 1 && this._selection === null;
        }
        read(callbackFn) {
          return readEditorState(this, callbackFn);
        }
        clone(selection) {
          const editorState = new EditorState(this._nodeMap, selection === void 0 ? this._selection : selection);
          editorState._readOnly = true;
          return editorState;
        }
        toJSON(space) {
          const selection = this._selection;
          return {
            _nodeMap: Array.from(this._nodeMap.entries()),
            _selection: $isRangeSelection(selection) ? {
              anchor: {
                key: selection.anchor.key,
                offset: selection.anchor.offset,
                type: selection.anchor.type
              },
              focus: {
                key: selection.focus.key,
                offset: selection.focus.offset,
                type: selection.focus.type
              },
              type: "range"
            } : $isNodeSelection(selection) ? {
              nodes: Array.from(selection._nodes),
              type: "node"
            } : $isGridSelection(selection) ? {
              anchorCellKey: selection.anchorCellKey,
              focusCellKey: selection.focusCellKey,
              gridKey: selection.gridKey,
              type: "grid"
            } : null
          };
        }
      };
      var PASS_THROUGH_COMMAND = Object.freeze({});
      var ANDROID_COMPOSITION_LATENCY = 30;
      var rootElementEvents = [
        ["keydown", onKeyDown],
        ["compositionstart", onCompositionStart],
        ["compositionend", onCompositionEnd],
        ["input", onInput],
        ["click", onClick],
        ["cut", PASS_THROUGH_COMMAND],
        ["copy", PASS_THROUGH_COMMAND],
        ["dragstart", PASS_THROUGH_COMMAND],
        ["paste", PASS_THROUGH_COMMAND],
        ["focus", PASS_THROUGH_COMMAND],
        ["blur", PASS_THROUGH_COMMAND]
      ];
      if (CAN_USE_BEFORE_INPUT) {
        rootElementEvents.push(["beforeinput", onBeforeInput]);
      } else {
        rootElementEvents.push(["drop", PASS_THROUGH_COMMAND]);
      }
      var lastKeyDownTimeStamp = 0;
      var rootElementsRegistered = 0;
      function onSelectionChange(domSelection, editor2, isActive) {
        updateEditor(editor2, () => {
          if (!isActive) {
            $setSelection(null);
            return;
          }
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            if (domSelection.type === "Range") {
              selection.dirty = true;
            }
            const anchor = selection.anchor;
            if (anchor.type === "text") {
              const anchorNode = anchor.getNode();
              selection.format = anchorNode.getFormat();
            } else if (anchor.type === "element") {
              selection.format = 0;
            }
          }
          dispatchCommand(editor2, SELECTION_CHANGE_COMMAND);
        });
      }
      function onClick(event, editor2) {
        updateEditor(editor2, () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchor = selection.anchor;
            if (anchor.type === "element" && anchor.offset === 0 && selection.isCollapsed() && $getRoot().getChildrenSize() === 1 && anchor.getNode().getTopLevelElementOrThrow().isEmpty()) {
              const lastSelection = editor2.getEditorState()._selection;
              if (lastSelection !== null && selection.is(lastSelection)) {
                getDOMSelection().removeAllRanges();
                selection.dirty = true;
              }
            }
          }
          dispatchCommand(editor2, CLICK_COMMAND, event);
        });
      }
      function $applyTargetRange(selection, event) {
        if (event.getTargetRanges) {
          const targetRange = event.getTargetRanges()[0];
          if (targetRange) {
            selection.applyDOMRange(targetRange);
          }
        }
      }
      function $canRemoveText(anchorNode, focusNode) {
        return anchorNode !== focusNode || $isElementNode(anchorNode) || $isElementNode(focusNode) || !$isTokenOrInert(anchorNode) || !$isTokenOrInert(focusNode);
      }
      function onBeforeInput(event, editor2) {
        const inputType = event.inputType;
        if (inputType === "deleteCompositionText" || IS_FIREFOX && isFirefoxClipboardEvents()) {
          return;
        } else if (inputType === "insertCompositionText") {
          const composedText = event.data;
          if (composedText) {
            updateEditor(editor2, () => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const anchor = selection.anchor;
                const node = anchor.getNode();
                const prevNode = node.getPreviousSibling();
                if (anchor.offset === 0 && $isTextNode(node) && $isTextNode(prevNode) && node.getTextContent() === " " && prevNode.getFormat() !== selection.format) {
                  const prevTextContent = prevNode.getTextContent();
                  if (composedText.indexOf(prevTextContent) === 0) {
                    const insertedText = composedText.slice(prevTextContent.length);
                    dispatchCommand(editor2, INSERT_TEXT_COMMAND, insertedText);
                    setTimeout(() => {
                      updateEditor(editor2, () => {
                        node.select();
                      });
                    }, ANDROID_COMPOSITION_LATENCY);
                  }
                }
              }
            });
          }
          return;
        }
        updateEditor(editor2, () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return;
          }
          if (inputType === "deleteContentBackward") {
            $setCompositionKey(null);
            event.preventDefault();
            lastKeyDownTimeStamp = 0;
            dispatchCommand(editor2, DELETE_CHARACTER_COMMAND, true);
            setTimeout(() => {
              editor2.update(() => {
                $setCompositionKey(null);
              });
            }, ANDROID_COMPOSITION_LATENCY);
            return;
          }
          const data = event.data;
          if (!selection.dirty && selection.isCollapsed() && !$isRootNode(selection.anchor.getNode())) {
            $applyTargetRange(selection, event);
          }
          const anchor = selection.anchor;
          const focus = selection.focus;
          const anchorNode = anchor.getNode();
          const focusNode = focus.getNode();
          if (inputType === "insertText") {
            if (data === "\n") {
              event.preventDefault();
              dispatchCommand(editor2, INSERT_LINE_BREAK_COMMAND);
            } else if (data === "\n\n") {
              event.preventDefault();
              dispatchCommand(editor2, INSERT_PARAGRAPH_COMMAND);
            } else if (data == null && event.dataTransfer) {
              const text = event.dataTransfer.getData("text/plain");
              event.preventDefault();
              selection.insertRawText(text);
            } else if (data != null && $shouldPreventDefaultAndInsertText(selection, data, true)) {
              event.preventDefault();
              dispatchCommand(editor2, INSERT_TEXT_COMMAND, data);
            }
            return;
          }
          event.preventDefault();
          switch (inputType) {
            case "insertFromYank":
            case "insertFromDrop":
            case "insertReplacementText": {
              dispatchCommand(editor2, INSERT_TEXT_COMMAND, event);
              break;
            }
            case "insertFromComposition": {
              $setCompositionKey(null);
              dispatchCommand(editor2, INSERT_TEXT_COMMAND, event);
              break;
            }
            case "insertLineBreak": {
              $setCompositionKey(null);
              dispatchCommand(editor2, INSERT_LINE_BREAK_COMMAND);
              break;
            }
            case "insertParagraph": {
              $setCompositionKey(null);
              dispatchCommand(editor2, INSERT_PARAGRAPH_COMMAND);
              break;
            }
            case "insertFromPaste":
            case "insertFromPasteAsQuotation": {
              dispatchCommand(editor2, PASTE_COMMAND, event);
              break;
            }
            case "deleteByComposition": {
              if ($canRemoveText(anchorNode, focusNode)) {
                dispatchCommand(editor2, REMOVE_TEXT_COMMAND);
              }
              break;
            }
            case "deleteByDrag":
            case "deleteByCut": {
              dispatchCommand(editor2, REMOVE_TEXT_COMMAND);
              break;
            }
            case "deleteContent": {
              dispatchCommand(editor2, DELETE_CHARACTER_COMMAND, false);
              break;
            }
            case "deleteWordBackward": {
              dispatchCommand(editor2, DELETE_WORD_COMMAND, true);
              break;
            }
            case "deleteWordForward": {
              dispatchCommand(editor2, DELETE_WORD_COMMAND, false);
              break;
            }
            case "deleteHardLineBackward":
            case "deleteSoftLineBackward": {
              dispatchCommand(editor2, DELETE_LINE_COMMAND, true);
              break;
            }
            case "deleteContentForward":
            case "deleteHardLineForward":
            case "deleteSoftLineForward": {
              dispatchCommand(editor2, DELETE_LINE_COMMAND, false);
              break;
            }
            case "formatStrikeThrough": {
              dispatchCommand(editor2, FORMAT_TEXT_COMMAND, "strikethrough");
              break;
            }
            case "formatBold": {
              dispatchCommand(editor2, FORMAT_TEXT_COMMAND, "bold");
              break;
            }
            case "formatItalic": {
              dispatchCommand(editor2, FORMAT_TEXT_COMMAND, "italic");
              break;
            }
            case "formatUnderline": {
              dispatchCommand(editor2, FORMAT_TEXT_COMMAND, "underline");
              break;
            }
            case "historyUndo": {
              dispatchCommand(editor2, UNDO_COMMAND);
              break;
            }
            case "historyRedo": {
              dispatchCommand(editor2, REDO_COMMAND);
              break;
            }
          }
        });
      }
      function onInput(event, editor2) {
        event.stopPropagation();
        updateEditor(editor2, () => {
          const selection = $getSelection();
          const data = event.data;
          if (data != null && $isRangeSelection(selection) && $shouldPreventDefaultAndInsertText(selection, data, false)) {
            dispatchCommand(editor2, INSERT_TEXT_COMMAND, data);
          } else {
            $updateSelectedTextFromDOM(editor2, null);
          }
          $flushMutations$1();
        });
      }
      function onCompositionStart(event, editor2) {
        updateEditor(editor2, () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && !editor2.isComposing()) {
            const anchor = selection.anchor;
            $setCompositionKey(anchor.key);
            if (event.timeStamp < lastKeyDownTimeStamp + ANDROID_COMPOSITION_LATENCY || anchor.type === "element" || !selection.isCollapsed() || selection.anchor.getNode().getFormat() !== selection.format) {
              dispatchCommand(editor2, INSERT_TEXT_COMMAND, " ");
            }
          }
        });
      }
      function onCompositionEnd(event, editor2) {
        updateEditor(editor2, () => {
          const compositionKey = editor2._compositionKey;
          $setCompositionKey(null);
          const data = event.data;
          if (compositionKey !== null && data != null) {
            if (data === "") {
              const node = $getNodeByKey(compositionKey);
              const textNode = getDOMTextNode(editor2.getElementByKey(compositionKey));
              if (textNode !== null && $isTextNode(node)) {
                $updateTextNodeFromDOMContent(node, textNode.nodeValue, null, null, true);
              }
              return;
            } else if (data[data.length - 1] === "\n") {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const focus = selection.focus;
                selection.anchor.set(focus.key, focus.offset, focus.type);
                dispatchCommand(editor2, KEY_ENTER_COMMAND, null);
                return;
              }
            }
          }
          $updateSelectedTextFromDOM(editor2, event);
        });
      }
      function onKeyDown(event, editor2) {
        lastKeyDownTimeStamp = event.timeStamp;
        if (editor2.isComposing()) {
          return;
        }
        const {
          keyCode,
          shiftKey,
          ctrlKey,
          metaKey,
          altKey
        } = event;
        if (isMoveForward(keyCode, ctrlKey, shiftKey, altKey, metaKey)) {
          dispatchCommand(editor2, KEY_ARROW_RIGHT_COMMAND, event);
        } else if (isMoveBackward(keyCode, ctrlKey, shiftKey, altKey, metaKey)) {
          dispatchCommand(editor2, KEY_ARROW_LEFT_COMMAND, event);
        } else if (isMoveUp(keyCode, ctrlKey, shiftKey, altKey, metaKey)) {
          dispatchCommand(editor2, KEY_ARROW_UP_COMMAND, event);
        } else if (isMoveDown(keyCode, ctrlKey, shiftKey, altKey, metaKey)) {
          dispatchCommand(editor2, KEY_ARROW_DOWN_COMMAND, event);
        } else if (isLineBreak(keyCode, shiftKey)) {
          dispatchCommand(editor2, KEY_ENTER_COMMAND, event);
        } else if (isOpenLineBreak(keyCode, ctrlKey)) {
          event.preventDefault();
          dispatchCommand(editor2, INSERT_LINE_BREAK_COMMAND, true);
        } else if (isParagraph(keyCode, shiftKey)) {
          dispatchCommand(editor2, KEY_ENTER_COMMAND, event);
        } else if (isDeleteBackward(keyCode, altKey, metaKey, ctrlKey)) {
          if (isBackspace(keyCode)) {
            dispatchCommand(editor2, KEY_BACKSPACE_COMMAND, event);
          } else {
            event.preventDefault();
            dispatchCommand(editor2, DELETE_CHARACTER_COMMAND, true);
          }
        } else if (isEscape(keyCode)) {
          dispatchCommand(editor2, KEY_ESCAPE_COMMAND, event);
        } else if (isDeleteForward(keyCode, ctrlKey, shiftKey, altKey, metaKey)) {
          if (isDelete(keyCode)) {
            dispatchCommand(editor2, KEY_DELETE_COMMAND, event);
          } else {
            event.preventDefault();
            dispatchCommand(editor2, DELETE_CHARACTER_COMMAND, false);
          }
        } else if (isDeleteWordBackward(keyCode, altKey, ctrlKey)) {
          event.preventDefault();
          dispatchCommand(editor2, DELETE_WORD_COMMAND, true);
        } else if (isDeleteWordForward(keyCode, altKey, ctrlKey)) {
          event.preventDefault();
          dispatchCommand(editor2, DELETE_WORD_COMMAND, false);
        } else if (isDeleteLineBackward(keyCode, metaKey)) {
          event.preventDefault();
          dispatchCommand(editor2, DELETE_LINE_COMMAND, true);
        } else if (isDeleteLineForward(keyCode, metaKey)) {
          event.preventDefault();
          dispatchCommand(editor2, DELETE_LINE_COMMAND, false);
        } else if (isBold(keyCode, metaKey, ctrlKey)) {
          event.preventDefault();
          dispatchCommand(editor2, FORMAT_TEXT_COMMAND, "bold");
        } else if (isUnderline(keyCode, metaKey, ctrlKey)) {
          event.preventDefault();
          dispatchCommand(editor2, FORMAT_TEXT_COMMAND, "underline");
        } else if (isItalic(keyCode, metaKey, ctrlKey)) {
          event.preventDefault();
          dispatchCommand(editor2, FORMAT_TEXT_COMMAND, "italic");
        } else if (isTab(keyCode, altKey, ctrlKey, metaKey)) {
          dispatchCommand(editor2, KEY_TAB_COMMAND, event);
        } else if (isUndo(keyCode, shiftKey, metaKey, ctrlKey)) {
          event.preventDefault();
          dispatchCommand(editor2, UNDO_COMMAND);
        } else if (isRedo(keyCode, shiftKey, metaKey, ctrlKey)) {
          event.preventDefault();
          dispatchCommand(editor2, REDO_COMMAND);
        }
      }
      function getRootElementRemoveHandles(rootElement) {
        let eventHandles = rootElement.__lexicalEventHandles;
        if (eventHandles === void 0) {
          eventHandles = [];
          rootElement.__lexicalEventHandles = eventHandles;
        }
        return eventHandles;
      }
      var activeNestedEditorsMap = /* @__PURE__ */ new Map();
      function onDocumentSelectionChange(event) {
        const selection = getDOMSelection();
        const nextActiveEditor = getNearestEditorFromDOMNode(selection.anchorNode);
        if (nextActiveEditor === null) {
          return;
        }
        const editors = getEditorsToPropagate(nextActiveEditor);
        const rootEditor = editors[editors.length - 1];
        const rootEditorKey = rootEditor._key;
        const activeNestedEditor = activeNestedEditorsMap.get(rootEditorKey);
        const prevActiveEditor = activeNestedEditor || rootEditor;
        if (prevActiveEditor !== nextActiveEditor) {
          onSelectionChange(selection, prevActiveEditor, false);
        }
        onSelectionChange(selection, nextActiveEditor, true);
        if (nextActiveEditor !== rootEditor) {
          activeNestedEditorsMap.set(rootEditorKey, nextActiveEditor);
        } else if (activeNestedEditor) {
          activeNestedEditorsMap.delete(rootEditorKey);
        }
      }
      function addRootElementEvents(rootElement, editor2) {
        if (rootElementsRegistered === 0) {
          const doc = rootElement.ownerDocument;
          doc.addEventListener("selectionchange", onDocumentSelectionChange);
        }
        rootElementsRegistered++;
        rootElement.__lexicalEditor = editor2;
        const removeHandles = getRootElementRemoveHandles(rootElement);
        for (let i = 0; i < rootElementEvents.length; i++) {
          const [eventName, onEvent] = rootElementEvents[i];
          const eventHandler = typeof onEvent === "function" ? (event) => {
            if (!editor2.isReadOnly()) {
              onEvent(event, editor2);
            }
          } : (event) => {
            if (!editor2.isReadOnly()) {
              switch (eventName) {
                case "cut":
                  return dispatchCommand(editor2, CUT_COMMAND, event);
                case "copy":
                  return dispatchCommand(editor2, COPY_COMMAND, event);
                case "paste":
                  return dispatchCommand(editor2, PASTE_COMMAND, event);
                case "dragstart":
                  return dispatchCommand(editor2, DRAGSTART_COMMAND, event);
                case "focus":
                  return dispatchCommand(editor2, FOCUS_COMMAND, event);
                case "blur":
                  return dispatchCommand(editor2, BLUR_COMMAND, event);
                case "drop":
                  return dispatchCommand(editor2, DROP_COMMAND, event);
              }
            }
          };
          rootElement.addEventListener(eventName, eventHandler);
          removeHandles.push(() => {
            rootElement.removeEventListener(eventName, eventHandler);
          });
        }
      }
      function removeRootElementEvents(rootElement) {
        if (rootElementsRegistered !== 0) {
          rootElementsRegistered--;
          if (rootElementsRegistered === 0) {
            const doc = rootElement.ownerDocument;
            doc.removeEventListener("selectionchange", onDocumentSelectionChange);
          }
        }
        const editor2 = rootElement.__lexicalEditor;
        if (editor2 != null) {
          cleanActiveNestedEditorsMap(editor2);
          rootElement.__lexicalEditor = null;
        }
        const removeHandles = getRootElementRemoveHandles(rootElement);
        for (let i = 0; i < removeHandles.length; i++) {
          removeHandles[i]();
        }
        rootElement.__lexicalEventHandles = [];
      }
      function cleanActiveNestedEditorsMap(editor2) {
        if (editor2._parentEditor !== null) {
          const editors = getEditorsToPropagate(editor2);
          const rootEditor = editors[editors.length - 1];
          const rootEditorKey = rootEditor._key;
          if (activeNestedEditorsMap.get(rootEditorKey) === editor2) {
            activeNestedEditorsMap.delete(rootEditorKey);
          }
        } else {
          activeNestedEditorsMap.delete(editor2._key);
        }
      }
      var LineBreakNode = class extends LexicalNode {
        static getType() {
          return "linebreak";
        }
        static clone(node) {
          return new LineBreakNode(node.__key);
        }
        constructor(key) {
          super(key);
        }
        getTextContent() {
          return "\n";
        }
        createDOM() {
          return document.createElement("br");
        }
        updateDOM() {
          return false;
        }
        static importDOM() {
          return {
            br: (node) => ({
              conversion: convertLineBreakElement,
              priority: 0
            })
          };
        }
      };
      function convertLineBreakElement(node) {
        return {
          node: $createLineBreakNode()
        };
      }
      function $createLineBreakNode() {
        return new LineBreakNode();
      }
      function $isLineBreakNode(node) {
        return node instanceof LineBreakNode;
      }
      function getElementOuterTag(node, format) {
        if (format & IS_CODE) {
          return "code";
        }
        return null;
      }
      function getElementInnerTag(node, format) {
        if (format & IS_BOLD) {
          return "strong";
        }
        if (format & IS_ITALIC) {
          return "em";
        }
        return "span";
      }
      function setTextThemeClassNames(tag, prevFormat, nextFormat, dom, textClassNames) {
        const domClassList = dom.classList;
        let classNames = getCachedClassNameArray(textClassNames, "base");
        if (classNames !== void 0) {
          domClassList.add(...classNames);
        }
        classNames = getCachedClassNameArray(textClassNames, "underlineStrikethrough");
        let hasUnderlineStrikethrough = false;
        const prevUnderlineStrikethrough = prevFormat & IS_UNDERLINE && prevFormat & IS_STRIKETHROUGH;
        const nextUnderlineStrikethrough = nextFormat & IS_UNDERLINE && nextFormat & IS_STRIKETHROUGH;
        if (classNames !== void 0) {
          if (nextUnderlineStrikethrough) {
            hasUnderlineStrikethrough = true;
            if (!prevUnderlineStrikethrough) {
              domClassList.add(...classNames);
            }
          } else if (prevUnderlineStrikethrough) {
            domClassList.remove(...classNames);
          }
        }
        for (const key in TEXT_TYPE_TO_FORMAT) {
          const format = key;
          const flag = TEXT_TYPE_TO_FORMAT[format];
          classNames = getCachedClassNameArray(textClassNames, key);
          if (classNames !== void 0) {
            if (nextFormat & flag) {
              if (hasUnderlineStrikethrough && (key === "underline" || key === "strikethrough")) {
                if (prevFormat & flag) {
                  domClassList.remove(...classNames);
                }
                continue;
              }
              if ((prevFormat & flag) === 0 || prevUnderlineStrikethrough && key === "underline" || key === "strikethrough") {
                domClassList.add(...classNames);
              }
            } else if (prevFormat & flag) {
              domClassList.remove(...classNames);
            }
          }
        }
      }
      function diffComposedText(a, b) {
        const aLength = a.length;
        const bLength = b.length;
        let left = 0;
        let right = 0;
        while (left < aLength && left < bLength && a[left] === b[left]) {
          left++;
        }
        while (right + left < aLength && right + left < bLength && a[aLength - right - 1] === b[bLength - right - 1]) {
          right++;
        }
        return [left, aLength - left - right, b.slice(left, bLength - right)];
      }
      function setTextContent(nextText, dom, node) {
        const firstChild = dom.firstChild;
        const isComposing = node.isComposing();
        const suffix = isComposing ? ZERO_WIDTH_CHAR : "";
        const text = nextText + suffix;
        if (firstChild == null) {
          dom.textContent = text;
        } else {
          const nodeValue = firstChild.nodeValue;
          if (nodeValue !== text)
            if (isComposing) {
              const [index, remove, insert] = diffComposedText(nodeValue, text);
              if (remove !== 0) {
                firstChild.deleteData(index, remove);
              }
              firstChild.insertData(index, insert);
            } else {
              firstChild.nodeValue = text;
            }
        }
      }
      function createTextInnerDOM(innerDOM, node, innerTag, format, text, config) {
        setTextContent(text, innerDOM, node);
        const theme = config.theme;
        const textClassNames = theme.text;
        if (textClassNames !== void 0) {
          setTextThemeClassNames(innerTag, 0, format, innerDOM, textClassNames);
        }
      }
      var TextNode = class extends LexicalNode {
        static getType() {
          return "text";
        }
        static clone(node) {
          return new TextNode(node.__text, node.__key);
        }
        constructor(text, key) {
          super(key);
          this.__text = text;
          this.__format = 0;
          this.__style = "";
          this.__mode = 0;
          this.__detail = 0;
        }
        getFormat() {
          const self = this.getLatest();
          return self.__format;
        }
        getStyle() {
          const self = this.getLatest();
          return self.__style;
        }
        isToken() {
          const self = this.getLatest();
          return self.__mode === IS_TOKEN;
        }
        isSegmented() {
          const self = this.getLatest();
          return self.__mode === IS_SEGMENTED;
        }
        isInert() {
          const self = this.getLatest();
          return self.__mode === IS_INERT;
        }
        isDirectionless() {
          const self = this.getLatest();
          return (self.__detail & IS_DIRECTIONLESS) !== 0;
        }
        isUnmergeable() {
          const self = this.getLatest();
          return (self.__detail & IS_UNMERGEABLE) !== 0;
        }
        hasFormat(type) {
          const formatFlag = TEXT_TYPE_TO_FORMAT[type];
          return (this.getFormat() & formatFlag) !== 0;
        }
        isSimpleText() {
          return this.__type === "text" && this.__mode === 0;
        }
        getTextContent(includeInert, includeDirectionless) {
          if (!includeInert && this.isInert() || includeDirectionless === false && this.isDirectionless()) {
            return "";
          }
          const self = this.getLatest();
          return self.__text;
        }
        getFormatFlags(type, alignWithFormat) {
          const self = this.getLatest();
          const format = self.__format;
          return toggleTextFormatType(format, type, alignWithFormat);
        }
        createDOM(config) {
          const format = this.__format;
          const outerTag = getElementOuterTag(this, format);
          const innerTag = getElementInnerTag(this, format);
          const tag = outerTag === null ? innerTag : outerTag;
          const dom = document.createElement(tag);
          let innerDOM = dom;
          if (outerTag !== null) {
            innerDOM = document.createElement(innerTag);
            dom.appendChild(innerDOM);
          }
          const text = this.__text;
          createTextInnerDOM(innerDOM, this, innerTag, format, text, config);
          const style = this.__style;
          if (style !== "") {
            dom.style.cssText = style;
          }
          return dom;
        }
        updateDOM(prevNode, dom, config) {
          const nextText = this.__text;
          const prevFormat = prevNode.__format;
          const nextFormat = this.__format;
          const prevOuterTag = getElementOuterTag(this, prevFormat);
          const nextOuterTag = getElementOuterTag(this, nextFormat);
          const prevInnerTag = getElementInnerTag(this, prevFormat);
          const nextInnerTag = getElementInnerTag(this, nextFormat);
          const prevTag = prevOuterTag === null ? prevInnerTag : prevOuterTag;
          const nextTag = nextOuterTag === null ? nextInnerTag : nextOuterTag;
          if (prevTag !== nextTag) {
            return true;
          }
          if (prevOuterTag === nextOuterTag && prevInnerTag !== nextInnerTag) {
            const prevInnerDOM = dom.firstChild;
            if (prevInnerDOM == null) {
              {
                throw Error(`updateDOM: prevInnerDOM is null or undefined`);
              }
            }
            const nextInnerDOM = document.createElement(nextInnerTag);
            createTextInnerDOM(nextInnerDOM, this, nextInnerTag, nextFormat, nextText, config);
            dom.replaceChild(nextInnerDOM, prevInnerDOM);
            return false;
          }
          let innerDOM = dom;
          if (nextOuterTag !== null) {
            if (prevOuterTag !== null) {
              innerDOM = dom.firstChild;
              if (innerDOM == null) {
                {
                  throw Error(`updateDOM: innerDOM is null or undefined`);
                }
              }
            }
          }
          setTextContent(nextText, innerDOM, this);
          const theme = config.theme;
          const textClassNames = theme.text;
          if (textClassNames !== void 0 && prevFormat !== nextFormat) {
            setTextThemeClassNames(nextInnerTag, prevFormat, nextFormat, innerDOM, textClassNames);
          }
          const prevStyle = prevNode.__style;
          const nextStyle = this.__style;
          if (prevStyle !== nextStyle) {
            dom.style.cssText = nextStyle;
          }
          return false;
        }
        static importDOM() {
          return {
            "#text": (node) => ({
              conversion: convertTextDOMNode,
              priority: 0
            }),
            b: (node) => ({
              conversion: convertBringAttentionToElement,
              priority: 0
            }),
            em: (node) => ({
              conversion: convertTextFormatElement,
              priority: 0
            }),
            i: (node) => ({
              conversion: convertTextFormatElement,
              priority: 0
            }),
            span: (node) => ({
              conversion: convertSpanElement,
              priority: 0
            }),
            strong: (node) => ({
              conversion: convertTextFormatElement,
              priority: 0
            }),
            u: (node) => ({
              conversion: convertTextFormatElement,
              priority: 0
            })
          };
        }
        selectionTransform(prevSelection, nextSelection) {
        }
        setFormat(format) {
          errorOnReadOnly();
          const self = this.getWritable();
          self.__format = format;
          return self;
        }
        setStyle(style) {
          errorOnReadOnly();
          const self = this.getWritable();
          self.__style = style;
          return self;
        }
        toggleFormat(type) {
          const formatFlag = TEXT_TYPE_TO_FORMAT[type];
          return this.setFormat(this.getFormat() ^ formatFlag);
        }
        toggleDirectionless() {
          errorOnReadOnly();
          const self = this.getWritable();
          self.__detail ^= IS_DIRECTIONLESS;
          return self;
        }
        toggleUnmergeable() {
          errorOnReadOnly();
          const self = this.getWritable();
          self.__detail ^= IS_UNMERGEABLE;
          return self;
        }
        setMode(type) {
          errorOnReadOnly();
          const mode = TEXT_MODE_TO_TYPE[type];
          const self = this.getWritable();
          self.__mode = mode;
          return self;
        }
        setTextContent(text) {
          errorOnReadOnly();
          const writableSelf = this.getWritable();
          writableSelf.__text = text;
          return writableSelf;
        }
        select(_anchorOffset, _focusOffset) {
          errorOnReadOnly();
          let anchorOffset = _anchorOffset;
          let focusOffset = _focusOffset;
          const selection = $getSelection();
          const text = this.getTextContent();
          const key = this.__key;
          if (typeof text === "string") {
            const lastOffset = text.length;
            if (anchorOffset === void 0) {
              anchorOffset = lastOffset;
            }
            if (focusOffset === void 0) {
              focusOffset = lastOffset;
            }
          } else {
            anchorOffset = 0;
            focusOffset = 0;
          }
          if (!$isRangeSelection(selection)) {
            return internalMakeRangeSelection(key, anchorOffset, key, focusOffset, "text", "text");
          } else {
            const compositionKey = $getCompositionKey();
            if (compositionKey === selection.anchor.key || compositionKey === selection.focus.key) {
              $setCompositionKey(key);
            }
            selection.setTextNodeRange(this, anchorOffset, this, focusOffset);
          }
          return selection;
        }
        spliceText(offset, delCount, newText, moveSelection) {
          errorOnReadOnly();
          const writableSelf = this.getWritable();
          const text = writableSelf.__text;
          const handledTextLength = newText.length;
          let index = offset;
          if (index < 0) {
            index = handledTextLength + index;
            if (index < 0) {
              index = 0;
            }
          }
          const selection = $getSelection();
          if (moveSelection && $isRangeSelection(selection)) {
            const newOffset = offset + handledTextLength;
            selection.setTextNodeRange(writableSelf, newOffset, writableSelf, newOffset);
          }
          const updatedText = text.slice(0, index) + newText + text.slice(index + delCount);
          return writableSelf.setTextContent(updatedText);
        }
        canInsertTextBefore() {
          return true;
        }
        canInsertTextAfter() {
          return true;
        }
        splitText(...splitOffsets) {
          errorOnReadOnly();
          const self = this.getLatest();
          const textContent = self.getTextContent();
          const key = self.__key;
          const compositionKey = $getCompositionKey();
          const offsetsSet = new Set(splitOffsets);
          const parts = [];
          const textLength = textContent.length;
          let string = "";
          for (let i = 0; i < textLength; i++) {
            if (string !== "" && offsetsSet.has(i)) {
              parts.push(string);
              string = "";
            }
            string += textContent[i];
          }
          if (string !== "") {
            parts.push(string);
          }
          const partsLength = parts.length;
          if (partsLength === 0) {
            return [];
          } else if (parts[0] === textContent) {
            return [self];
          }
          const firstPart = parts[0];
          const parent = self.getParentOrThrow();
          const parentKey = parent.__key;
          let writableNode;
          const format = self.getFormat();
          const style = self.getStyle();
          const detail = self.__detail;
          let hasReplacedSelf = false;
          if (self.isSegmented()) {
            writableNode = $createTextNode(firstPart);
            writableNode.__parent = parentKey;
            writableNode.__format = format;
            writableNode.__style = style;
            writableNode.__detail = detail;
            hasReplacedSelf = true;
          } else {
            writableNode = self.getWritable();
            writableNode.__text = firstPart;
          }
          const selection = $getSelection();
          const splitNodes = [writableNode];
          let textSize = firstPart.length;
          for (let i = 1; i < partsLength; i++) {
            const part = parts[i];
            const partSize = part.length;
            const sibling = $createTextNode(part).getWritable();
            sibling.__format = format;
            sibling.__style = style;
            sibling.__detail = detail;
            const siblingKey = sibling.__key;
            const nextTextSize = textSize + partSize;
            if ($isRangeSelection(selection)) {
              const anchor = selection.anchor;
              const focus = selection.focus;
              if (anchor.key === key && anchor.type === "text" && anchor.offset > textSize && anchor.offset <= nextTextSize) {
                anchor.key = siblingKey;
                anchor.offset -= textSize;
                selection.dirty = true;
              }
              if (focus.key === key && focus.type === "text" && focus.offset > textSize && focus.offset <= nextTextSize) {
                focus.key = siblingKey;
                focus.offset -= textSize;
                selection.dirty = true;
              }
            }
            if (compositionKey === key) {
              $setCompositionKey(siblingKey);
            }
            textSize = nextTextSize;
            sibling.__parent = parentKey;
            splitNodes.push(sibling);
          }
          internalMarkSiblingsAsDirty(this);
          const writableParent = parent.getWritable();
          const writableParentChildren = writableParent.__children;
          const insertionIndex = writableParentChildren.indexOf(key);
          const splitNodesKeys = splitNodes.map((splitNode) => splitNode.__key);
          if (hasReplacedSelf) {
            writableParentChildren.splice(insertionIndex, 0, ...splitNodesKeys);
            this.remove();
          } else {
            writableParentChildren.splice(insertionIndex, 1, ...splitNodesKeys);
          }
          if ($isRangeSelection(selection)) {
            $updateElementSelectionOnCreateDeleteNode(selection, parent, insertionIndex, partsLength - 1);
          }
          return splitNodes;
        }
        mergeWithSibling(target) {
          const isBefore = target === this.getPreviousSibling();
          if (!isBefore && target !== this.getNextSibling()) {
            {
              throw Error(`mergeWithSibling: sibling must be a previous or next sibling`);
            }
          }
          const key = this.__key;
          const targetKey = target.__key;
          const text = this.__text;
          const textLength = text.length;
          const compositionKey = $getCompositionKey();
          if (compositionKey === targetKey) {
            $setCompositionKey(key);
          }
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchor = selection.anchor;
            const focus = selection.focus;
            if (anchor !== null && anchor.key === targetKey) {
              adjustPointOffsetForMergedSibling(anchor, isBefore, key, target, textLength);
              selection.dirty = true;
            }
            if (focus !== null && focus.key === targetKey) {
              adjustPointOffsetForMergedSibling(focus, isBefore, key, target, textLength);
              selection.dirty = true;
            }
          }
          const newText = isBefore ? target.__text + text : text + target.__text;
          this.setTextContent(newText);
          target.remove();
          return this.getLatest();
        }
        isTextEntity() {
          return false;
        }
      };
      function convertSpanElement(domNode) {
        const span = domNode;
        const hasBoldFontWeight = span.style.fontWeight === "700";
        return {
          forChild: (lexicalNode) => {
            if ($isTextNode(lexicalNode) && hasBoldFontWeight) {
              lexicalNode.toggleFormat("bold");
            }
            return lexicalNode;
          },
          node: null
        };
      }
      function convertBringAttentionToElement(domNode) {
        const b = domNode;
        const hasNormalFontWeight = b.style.fontWeight === "normal";
        return {
          forChild: (lexicalNode) => {
            if ($isTextNode(lexicalNode) && !hasNormalFontWeight) {
              lexicalNode.toggleFormat("bold");
            }
            return lexicalNode;
          },
          node: null
        };
      }
      function convertTextDOMNode(domNode) {
        return {
          node: $createTextNode(domNode.textContent)
        };
      }
      var nodeNameToTextFormat = {
        em: "italic",
        i: "italic",
        strong: "bold",
        u: "underline"
      };
      function convertTextFormatElement(domNode) {
        const format = nodeNameToTextFormat[domNode.nodeName.toLowerCase()];
        if (format === void 0) {
          return {
            node: null
          };
        }
        return {
          forChild: (lexicalNode) => {
            if ($isTextNode(lexicalNode)) {
              lexicalNode.toggleFormat(format);
            }
            return lexicalNode;
          },
          node: null
        };
      }
      function $createTextNode(text = "") {
        return new TextNode(text);
      }
      function $isTextNode(node) {
        return node instanceof TextNode;
      }
      var ParagraphNode = class extends ElementNode {
        static getType() {
          return "paragraph";
        }
        static clone(node) {
          return new ParagraphNode(node.__key);
        }
        constructor(key) {
          super(key);
        }
        createDOM(config) {
          const dom = document.createElement("p");
          const classNames = getCachedClassNameArray(config.theme, "paragraph");
          if (classNames !== void 0) {
            const domClassList = dom.classList;
            domClassList.add(...classNames);
          }
          return dom;
        }
        updateDOM(prevNode, dom) {
          return false;
        }
        static importDOM() {
          return {
            p: (node) => ({
              conversion: convertParagraphElement,
              priority: 0
            })
          };
        }
        exportDOM(editor2) {
          const {
            element
          } = super.exportDOM(editor2);
          if (element) {
            if (this.getTextContentSize() === 0) {
              element.append(document.createElement("br"));
            }
          }
          return {
            element
          };
        }
        insertNewAfter() {
          const newElement = $createParagraphNode();
          const direction = this.getDirection();
          newElement.setDirection(direction);
          this.insertAfter(newElement);
          return newElement;
        }
        collapseAtStart() {
          const children = this.getChildren();
          if (children.length === 0 || $isTextNode(children[0]) && children[0].getTextContent().trim() === "") {
            const nextSibling = this.getNextSibling();
            if (nextSibling !== null) {
              this.selectNext();
              this.remove();
              return true;
            }
            const prevSibling = this.getPreviousSibling();
            if (prevSibling !== null) {
              this.selectPrevious();
              this.remove();
              return true;
            }
          }
          return false;
        }
      };
      function convertParagraphElement() {
        return {
          node: $createParagraphNode()
        };
      }
      function $createParagraphNode() {
        return new ParagraphNode();
      }
      function $isParagraphNode(node) {
        return node instanceof ParagraphNode;
      }
      function resetEditor(editor2, prevRootElement, nextRootElement, pendingEditorState) {
        const keyNodeMap = editor2._keyToDOMMap;
        keyNodeMap.clear();
        editor2._editorState = createEmptyEditorState();
        editor2._pendingEditorState = pendingEditorState;
        editor2._compositionKey = null;
        editor2._dirtyType = NO_DIRTY_NODES;
        editor2._cloneNotNeeded.clear();
        editor2._dirtyLeaves = /* @__PURE__ */ new Set();
        editor2._dirtyElements.clear();
        editor2._normalizedNodes = /* @__PURE__ */ new Set();
        editor2._updateTags = /* @__PURE__ */ new Set();
        editor2._updates = [];
        const observer = editor2._observer;
        if (observer !== null) {
          observer.disconnect();
          editor2._observer = null;
        }
        if (prevRootElement !== null) {
          prevRootElement.textContent = "";
        }
        if (nextRootElement !== null) {
          nextRootElement.textContent = "";
          keyNodeMap.set("root", nextRootElement);
        }
      }
      function initializeConversionCache(nodes) {
        const conversionCache = /* @__PURE__ */ new Map();
        const handledConversions = /* @__PURE__ */ new Set();
        nodes.forEach((node) => {
          const importDOM = node.klass.importDOM;
          if (handledConversions.has(importDOM)) {
            return;
          }
          handledConversions.add(importDOM);
          const map = importDOM();
          if (map !== null) {
            Object.keys(map).forEach((key) => {
              let currentCache = conversionCache.get(key);
              if (currentCache === void 0) {
                currentCache = [];
                conversionCache.set(key, currentCache);
              }
              currentCache.push(map[key]);
            });
          }
        });
        return conversionCache;
      }
      function createEditor2(editorConfig) {
        const config = editorConfig || {};
        const namespace = config.namespace || createUID();
        const theme = config.theme || {};
        const context = config.context || {};
        const parentEditor = config.parentEditor || null;
        const disableEvents = config.disableEvents || false;
        const editorState = createEmptyEditorState();
        const initialEditorState = config.editorState;
        const nodes = [RootNode, TextNode, LineBreakNode, ParagraphNode, ...config.nodes || []];
        const onError = config.onError;
        const isReadOnly = config.readOnly || false;
        const registeredNodes = /* @__PURE__ */ new Map();
        for (let i = 0; i < nodes.length; i++) {
          const klass = nodes[i];
          const type = klass.getType();
          registeredNodes.set(type, {
            klass,
            transforms: /* @__PURE__ */ new Set()
          });
        }
        const editor2 = new LexicalEditor(editorState, parentEditor, registeredNodes, {
          context,
          disableEvents,
          namespace,
          theme
        }, onError, initializeConversionCache(registeredNodes), isReadOnly);
        if (initialEditorState !== void 0) {
          editor2._pendingEditorState = initialEditorState;
          editor2._dirtyType = FULL_RECONCILE;
        }
        return editor2;
      }
      var LexicalEditor = class {
        constructor(editorState, parentEditor, nodes, config, onError, htmlConversions, readOnly) {
          this._parentEditor = parentEditor;
          this._rootElement = null;
          this._editorState = editorState;
          this._pendingEditorState = null;
          this._compositionKey = null;
          this._deferred = [];
          this._keyToDOMMap = /* @__PURE__ */ new Map();
          this._updates = [];
          this._updating = false;
          this._listeners = {
            decorator: /* @__PURE__ */ new Set(),
            mutation: /* @__PURE__ */ new Map(),
            readonly: /* @__PURE__ */ new Set(),
            root: /* @__PURE__ */ new Set(),
            textcontent: /* @__PURE__ */ new Set(),
            update: /* @__PURE__ */ new Set()
          };
          this._commands = /* @__PURE__ */ new Map();
          this._config = config;
          this._nodes = nodes;
          this._decorators = {};
          this._pendingDecorators = null;
          this._dirtyType = NO_DIRTY_NODES;
          this._cloneNotNeeded = /* @__PURE__ */ new Set();
          this._dirtyLeaves = /* @__PURE__ */ new Set();
          this._dirtyElements = /* @__PURE__ */ new Map();
          this._normalizedNodes = /* @__PURE__ */ new Set();
          this._updateTags = /* @__PURE__ */ new Set();
          this._observer = null;
          this._key = generateRandomKey();
          this._onError = onError;
          this._htmlConversions = htmlConversions;
          this._readOnly = false;
        }
        isComposing() {
          return this._compositionKey != null;
        }
        registerUpdateListener(listener) {
          const listenerSetOrMap = this._listeners.update;
          listenerSetOrMap.add(listener);
          return () => {
            listenerSetOrMap.delete(listener);
          };
        }
        registerReadOnlyListener(listener) {
          const listenerSetOrMap = this._listeners.readonly;
          listenerSetOrMap.add(listener);
          return () => {
            listenerSetOrMap.delete(listener);
          };
        }
        registerDecoratorListener(listener) {
          const listenerSetOrMap = this._listeners.decorator;
          listenerSetOrMap.add(listener);
          return () => {
            listenerSetOrMap.delete(listener);
          };
        }
        registerTextContentListener(listener) {
          const listenerSetOrMap = this._listeners.textcontent;
          listenerSetOrMap.add(listener);
          return () => {
            listenerSetOrMap.delete(listener);
          };
        }
        registerRootListener(listener) {
          const listenerSetOrMap = this._listeners.root;
          listener(this._rootElement, null);
          listenerSetOrMap.add(listener);
          return () => {
            listener(null, this._rootElement);
            listenerSetOrMap.delete(listener);
          };
        }
        registerCommand(command, listener, priority) {
          if (priority === void 0) {
            {
              throw Error(`Listener for type "command" requires a "priority".`);
            }
          }
          const commandsMap = this._commands;
          if (!commandsMap.has(command)) {
            commandsMap.set(command, [/* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set()]);
          }
          const listenersInPriorityOrder = commandsMap.get(command);
          if (listenersInPriorityOrder === void 0) {
            {
              throw Error(`registerCommand: Command ${command} not found in command map`);
            }
          }
          const listeners = listenersInPriorityOrder[priority];
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
            if (listenersInPriorityOrder.every((listenersSet) => listenersSet.size === 0)) {
              commandsMap.delete(command);
            }
          };
        }
        registerMutationListener(klass, listener) {
          const registeredNode = this._nodes.get(klass.getType());
          if (registeredNode === void 0) {
            {
              throw Error(`Node ${klass.name} has not been registered. Ensure node has been passed to createEditor.`);
            }
          }
          const mutations = this._listeners.mutation;
          mutations.set(listener, klass);
          return () => {
            mutations.delete(listener);
          };
        }
        registerNodeTransform(klass, listener) {
          const type = klass.getType();
          const registeredNode = this._nodes.get(type);
          if (registeredNode === void 0) {
            {
              throw Error(`Node ${klass.name} has not been registered. Ensure node has been passed to createEditor.`);
            }
          }
          const transforms = registeredNode.transforms;
          transforms.add(listener);
          markAllNodesAsDirty(this, type);
          return () => {
            transforms.delete(listener);
          };
        }
        hasNodes(nodes) {
          for (let i = 0; i < nodes.length; i++) {
            const klass = nodes[i];
            const type = klass.getType();
            if (!this._nodes.has(type)) {
              return false;
            }
          }
          return true;
        }
        dispatchCommand(type, payload) {
          return dispatchCommand(this, type, payload);
        }
        getDecorators() {
          return this._decorators;
        }
        getRootElement() {
          return this._rootElement;
        }
        getKey() {
          return this._key;
        }
        setRootElement(nextRootElement) {
          const prevRootElement = this._rootElement;
          if (nextRootElement !== prevRootElement) {
            const pendingEditorState = this._pendingEditorState || this._editorState;
            this._rootElement = nextRootElement;
            resetEditor(this, prevRootElement, nextRootElement, pendingEditorState);
            if (prevRootElement !== null) {
              if (!this._config.disableEvents) {
                removeRootElementEvents(prevRootElement);
              }
            }
            if (nextRootElement !== null) {
              const style = nextRootElement.style;
              style.userSelect = "text";
              style.whiteSpace = "pre-wrap";
              style.wordBreak = "break-word";
              nextRootElement.setAttribute("data-lexical-editor", "true");
              this._dirtyType = FULL_RECONCILE;
              initMutationObserver(this);
              this._updateTags.add("history-merge");
              commitPendingUpdates(this);
              if (!this._config.disableEvents) {
                addRootElementEvents(nextRootElement, this);
              }
            }
            triggerListeners("root", this, false, nextRootElement, prevRootElement);
          }
        }
        getElementByKey(key) {
          return this._keyToDOMMap.get(key) || null;
        }
        getEditorState() {
          return this._editorState;
        }
        setEditorState(editorState, options) {
          if (editorState.isEmpty()) {
            {
              throw Error(`setEditorState: the editor state is empty. Ensure the editor state's root node never becomes empty.`);
            }
          }
          flushRootMutations(this);
          const pendingEditorState = this._pendingEditorState;
          const tags = this._updateTags;
          const tag = options !== void 0 ? options.tag : null;
          if (pendingEditorState !== null && !pendingEditorState.isEmpty()) {
            if (tag != null) {
              tags.add(tag);
            }
            commitPendingUpdates(this);
          }
          this._pendingEditorState = editorState;
          this._dirtyType = FULL_RECONCILE;
          this._compositionKey = null;
          if (tag != null) {
            tags.add(tag);
          }
          commitPendingUpdates(this);
        }
        parseEditorState(stringifiedEditorState) {
          const parsedEditorState = JSON.parse(stringifiedEditorState);
          return parseEditorState(parsedEditorState, this);
        }
        update(updateFn, options) {
          updateEditor(this, updateFn, options);
        }
        focus(callbackFn) {
          const rootElement = this._rootElement;
          if (rootElement !== null) {
            rootElement.setAttribute("autocapitalize", "off");
            updateEditor(this, () => {
              const selection = $getSelection();
              const root = $getRoot();
              if (selection !== null) {
                selection.dirty = true;
              } else if (root.getChildrenSize() !== 0) {
                root.selectEnd();
              }
            }, {
              onUpdate: () => {
                rootElement.removeAttribute("autocapitalize");
                if (callbackFn) {
                  callbackFn();
                }
              }
            });
          }
        }
        blur() {
          const rootElement = this._rootElement;
          if (rootElement !== null) {
            rootElement.blur();
          }
          const domSelection = getDOMSelection();
          if (domSelection !== null) {
            domSelection.removeAllRanges();
          }
        }
        isReadOnly() {
          return this._readOnly;
        }
        setReadOnly(readOnly) {
          this._readOnly = readOnly;
          triggerListeners("readonly", this, true, readOnly);
        }
        toJSON() {
          return {
            editorState: this._editorState
          };
        }
      };
      var VERSION = "0.2.1";
      var GridCellNode = class extends ElementNode {
        constructor(colSpan, key) {
          super(key);
        }
      };
      function $isGridCellNode(node) {
        return node instanceof GridCellNode;
      }
      var GridNode = class extends ElementNode {
      };
      function $isGridNode(node) {
        return node instanceof GridNode;
      }
      var GridRowNode = class extends ElementNode {
      };
      function $isGridRowNode(node) {
        return node instanceof GridRowNode;
      }
      function createCommand() {
        return {};
      }
      var SELECTION_CHANGE_COMMAND = createCommand();
      var CLICK_COMMAND = createCommand();
      var DELETE_CHARACTER_COMMAND = createCommand();
      var INSERT_LINE_BREAK_COMMAND = createCommand();
      var INSERT_PARAGRAPH_COMMAND = createCommand();
      var INSERT_TEXT_COMMAND = createCommand();
      var PASTE_COMMAND = createCommand();
      var REMOVE_TEXT_COMMAND = createCommand();
      var DELETE_WORD_COMMAND = createCommand();
      var DELETE_LINE_COMMAND = createCommand();
      var FORMAT_TEXT_COMMAND = createCommand();
      var UNDO_COMMAND = createCommand();
      var REDO_COMMAND = createCommand();
      var KEY_ARROW_RIGHT_COMMAND = createCommand();
      var KEY_ARROW_LEFT_COMMAND = createCommand();
      var KEY_ARROW_UP_COMMAND = createCommand();
      var KEY_ARROW_DOWN_COMMAND = createCommand();
      var KEY_ENTER_COMMAND = createCommand();
      var KEY_BACKSPACE_COMMAND = createCommand();
      var KEY_ESCAPE_COMMAND = createCommand();
      var KEY_DELETE_COMMAND = createCommand();
      var KEY_TAB_COMMAND = createCommand();
      var INDENT_CONTENT_COMMAND = createCommand();
      var OUTDENT_CONTENT_COMMAND = createCommand();
      var DROP_COMMAND = createCommand();
      var FORMAT_ELEMENT_COMMAND = createCommand();
      var DRAGSTART_COMMAND = createCommand();
      var COPY_COMMAND = createCommand();
      var CUT_COMMAND = createCommand();
      var CLEAR_EDITOR_COMMAND = createCommand();
      var CLEAR_HISTORY_COMMAND = createCommand();
      var CAN_REDO_COMMAND = createCommand();
      var CAN_UNDO_COMMAND = createCommand();
      var FOCUS_COMMAND = createCommand();
      var BLUR_COMMAND = createCommand();
      var READ_ONLY_COMMAND = createCommand();
      exports.$createGridSelection = $createEmptyGridSelection;
      exports.$createLineBreakNode = $createLineBreakNode;
      exports.$createNodeFromParse = $createNodeFromParse;
      exports.$createNodeSelection = $createEmptyObjectSelection;
      exports.$createParagraphNode = $createParagraphNode;
      exports.$createRangeSelection = $createEmptyRangeSelection;
      exports.$createTextNode = $createTextNode;
      exports.$getDecoratorNode = $getDecoratorNode;
      exports.$getNearestNodeFromDOMNode = $getNearestNodeFromDOMNode;
      exports.$getNodeByKey = $getNodeByKey;
      exports.$getPreviousSelection = $getPreviousSelection;
      exports.$getRoot = $getRoot;
      exports.$getSelection = $getSelection;
      exports.$isDecoratorNode = $isDecoratorNode;
      exports.$isElementNode = $isElementNode;
      exports.$isGridCellNode = $isGridCellNode;
      exports.$isGridNode = $isGridNode;
      exports.$isGridRowNode = $isGridRowNode;
      exports.$isGridSelection = $isGridSelection;
      exports.$isLeafNode = $isLeafNode;
      exports.$isLineBreakNode = $isLineBreakNode;
      exports.$isNodeSelection = $isNodeSelection;
      exports.$isParagraphNode = $isParagraphNode;
      exports.$isRangeSelection = $isRangeSelection;
      exports.$isRootNode = $isRootNode;
      exports.$isTextNode = $isTextNode;
      exports.$nodesOfType = $nodesOfType;
      exports.$setCompositionKey = $setCompositionKey;
      exports.$setSelection = $setSelection;
      exports.BLUR_COMMAND = BLUR_COMMAND;
      exports.CAN_REDO_COMMAND = CAN_REDO_COMMAND;
      exports.CAN_UNDO_COMMAND = CAN_UNDO_COMMAND;
      exports.CLEAR_EDITOR_COMMAND = CLEAR_EDITOR_COMMAND;
      exports.CLEAR_HISTORY_COMMAND = CLEAR_HISTORY_COMMAND;
      exports.CLICK_COMMAND = CLICK_COMMAND;
      exports.COPY_COMMAND = COPY_COMMAND;
      exports.CUT_COMMAND = CUT_COMMAND;
      exports.DELETE_CHARACTER_COMMAND = DELETE_CHARACTER_COMMAND;
      exports.DELETE_LINE_COMMAND = DELETE_LINE_COMMAND;
      exports.DELETE_WORD_COMMAND = DELETE_WORD_COMMAND;
      exports.DRAGSTART_COMMAND = DRAGSTART_COMMAND;
      exports.DROP_COMMAND = DROP_COMMAND;
      exports.DecoratorNode = DecoratorNode;
      exports.ElementNode = ElementNode;
      exports.FOCUS_COMMAND = FOCUS_COMMAND;
      exports.FORMAT_ELEMENT_COMMAND = FORMAT_ELEMENT_COMMAND;
      exports.FORMAT_TEXT_COMMAND = FORMAT_TEXT_COMMAND;
      exports.GridCellNode = GridCellNode;
      exports.GridNode = GridNode;
      exports.GridRowNode = GridRowNode;
      exports.INDENT_CONTENT_COMMAND = INDENT_CONTENT_COMMAND;
      exports.INSERT_LINE_BREAK_COMMAND = INSERT_LINE_BREAK_COMMAND;
      exports.INSERT_PARAGRAPH_COMMAND = INSERT_PARAGRAPH_COMMAND;
      exports.INSERT_TEXT_COMMAND = INSERT_TEXT_COMMAND;
      exports.KEY_ARROW_DOWN_COMMAND = KEY_ARROW_DOWN_COMMAND;
      exports.KEY_ARROW_LEFT_COMMAND = KEY_ARROW_LEFT_COMMAND;
      exports.KEY_ARROW_RIGHT_COMMAND = KEY_ARROW_RIGHT_COMMAND;
      exports.KEY_ARROW_UP_COMMAND = KEY_ARROW_UP_COMMAND;
      exports.KEY_BACKSPACE_COMMAND = KEY_BACKSPACE_COMMAND;
      exports.KEY_DELETE_COMMAND = KEY_DELETE_COMMAND;
      exports.KEY_ENTER_COMMAND = KEY_ENTER_COMMAND;
      exports.KEY_ESCAPE_COMMAND = KEY_ESCAPE_COMMAND;
      exports.KEY_TAB_COMMAND = KEY_TAB_COMMAND;
      exports.OUTDENT_CONTENT_COMMAND = OUTDENT_CONTENT_COMMAND;
      exports.PASTE_COMMAND = PASTE_COMMAND;
      exports.ParagraphNode = ParagraphNode;
      exports.READ_ONLY_COMMAND = READ_ONLY_COMMAND;
      exports.REDO_COMMAND = REDO_COMMAND;
      exports.REMOVE_TEXT_COMMAND = REMOVE_TEXT_COMMAND;
      exports.SELECTION_CHANGE_COMMAND = SELECTION_CHANGE_COMMAND;
      exports.TextNode = TextNode;
      exports.UNDO_COMMAND = UNDO_COMMAND;
      exports.VERSION = VERSION;
      exports.createCommand = createCommand;
      exports.createEditor = createEditor2;
    }
  });

  // ../../node_modules/lexical/Lexical.js
  var require_Lexical = __commonJS({
    "../../node_modules/lexical/Lexical.js"(exports, module) {
      "use strict";
      var Lexical = true ? require_Lexical_dev() : null;
      module.exports = Lexical;
    }
  });

  // EditorEmbed.ts
  var import_lexical = __toESM(require_Lexical());
  var editor = (0, import_lexical.createEditor)({
    onError: (e) => {
      console.error(e);
    }
  });
  alert("editor embed.");
  var contentEditableElement = window.document.getElementById("editor");
  editor.setRootElement(contentEditableElement);
})();
