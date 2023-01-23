// Inspired by https://github.com/j0lv3r4/mdx-prism

import { toString } from 'hast-util-to-string'
import rangeParser from 'parse-numeric-range'
import { refractor } from 'refractor'
import tsx from 'refractor/lang/tsx'
import visit from 'unist-util-visit'

import highlightLine from './rehype-highlight-line'
import highlightWord from './rehype-highlight-word'

refractor.register(tsx)

export default (options = {}) => {
  return (tree) => {
    visit(tree, 'element', visitor)
  }

  function visitor(node, index, parent) {
    if (
      !parent ||
      parent.tagName !== 'pre' ||
      node.tagName !== 'code' ||
      !node.properties.className
    ) {
      return
    }

    const [_, lang] = node.properties.className[0].split('-')
    const codeString = toString(node)
    let result = refractor.highlight(codeString, lang)

    const linesToHighlight = rangeParser(node.properties.line || '0')
    result = highlightLine(result, linesToHighlight)

    node.children = highlightWord(result)
  }
}
