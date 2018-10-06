
const MarkdownIt = require('markdown-it')
const MarkdownItAnchor = require('markdown-it-anchor')
const MarkdownItAttrs = require('markdown-it-attrs')
const MarkdownItCJKBreaks = require('markdown-it-cjk-breaks')
const MarkdownItContainer = require('markdown-it-container')
const MarkdownItEmoji = require('markdown-it-emoji')
const MarkdownItFootnote = require('markdown-it-footnote')

const hljs = require('highlight.js')
const lodash = require('lodash')

const md = new MarkdownIt('default', {
  html: true,
  breaks: true,
  langPrefix: 'lang-',
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          `<pre class="hljs"><code>${
            hljs.highlight(lang, str).value
          }</code></pre>`
        )
      } catch (_) {}

      try {
        return (
          `<pre class="hljs"><code>${
            hljs.highlightAuto(str).value
          }</code></pre>`
        )
      } catch (_) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})
  .use(MarkdownItAnchor, {
    level: [1, 2],
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: '#',
    slugify: lodash.kebabCase
  })
  .use(MarkdownItAttrs)
  // .use(MarkdownItCJKBreaks)
  .use(MarkdownItEmoji)
  .use(MarkdownItFootnote)

module.exports = md
