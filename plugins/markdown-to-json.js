const path = require('path')
const pLimit = require('p-limit')
const globby = require('globby')
const frontmatter = require('front-matter')
var { stat, readFile, writeFile, extractTitle, extractExcerpt } = require('./utils')
const md = require('./markdown')

const NAME = 'markdown-webpack-plugin'

function wrapArray(val) {
  if (Array.isArray(val)) {
    return val
  } else if (!val) {
    return []
  } else {
    return [val]
  }
}

function processMarkdown(globalRef, file) {
  const {info, debug, compilation, fileDependencies, written, inputFileSystem, copyUnmodified} = globalRef
  return stat(inputFileSystem, file.from)
    .then((stat) => {
      if (stat.isDirectory()) { }

      fileDependencies.push(file.from)
      info(`reading ${file.from} to write to assets`)

      return readFile(inputFileSystem, file.from)
        .then((content) => {
          try {
            let parsed = frontmatter(content.toString())
            return Promise.resolve(parsed)
          } catch (err) {
            return Promise.reject(err)
          }
        })
        .then(parsed => {
          try {
            let data = parsed.attributes
            data.body = md.render(parsed.body)
            return Promise.resolve(data)
          } catch (err) {
            return Promise.reject(err)
          }
        })
        .then(data => {
          if (!data.title) {
            data.title = extractTitle(data.body)
          }
          data.updated = stat.mtime.toISOString()
          data.slug = data.title
          data.categories = wrapArray(data.categories)
          data.tags = wrapArray(data.tags)
          return data
        })
    })
}

function processData(globalRef, postData) {
  const {info, debug, posts, categories, tags } = globalRef
  const options = {
    site: true,
    posts_size: 0,
    posts_props: {
      title: true,
      slug: true,
      date: true,
      updated: true,
      comments: true,
      cover: true,
      path: true,
      photos: true,
      text: true,
      raw: false,
      link: true,
      excerpt: true,
      content: true,
      categories: true,
      tags: true
    },
    categories: true,
    tags: true,
    post: true,
    pages: true
  }
  let writeData = []
  const categoryMap = new Map()
  const tagMap = new Map()
  postData = postData.sort('-date').filter((post) => post.published !== false)
  let _ = (function() {
    const props = options.posts_props
    return function (name, val) {
      return props[name] ? (typeof val === 'function' ? val() : val) : null
    }
  })()

  let mapPost = function (post) {
    return {
      title: _('title', post.title),
      banner: _('banner', post.banner),
      slug: _('slug', post.slug),
      date: _('date', post.date),
      updated: _('updated', post.updated),
      comments: _('comments', post.comments),
      path: _('path', 'static/articles/' + post.slug + '.json'),
      excerpt: _('excerpt', extractExcerpt(post.body)),
      keywords: _('keywords', post.keywords),
      content: _('content', post.body),
      categories: _('categories', function() {
        return post.categories.map((category) => {
          return {
            name: category,
            path: 'static/categories/' + category + '.json'
          }
        })
      }),
      tags: _('tags', function () {
        return post.tags.map((tag) => {
          return {
            name: tag,
            path: 'static/tags/' + tag + '.json'
          }
        })
      })
    }
  }

  let mapTags = function (tag) {
    return {
      name: tag.name,
      path: tag.path,
      count: tag.posts.length
    }
  }

  let mapTag = function (tag) {
    return {
      path: tag.path,
      data: {
        name: tag.name,
        posts: tag.posts
      }
    }
  }

  let genCate = function (map, kind, post) {
    if (!post[kind]) { return }
    if (!Array.isArray(post[kind])) {
      post[kind] = [post.kind]
    }
    let postCopy = Object.assign({}, post)
    delete postCopy.content

    for (let item of post[kind]) {
      if (!map.has(item.name)) {
        map.set(item.name, {
          name: item.name,
          path: item.path,
          posts: [postCopy]
        })
      } else {
        map.get(item.name).posts.push(postCopy)
      }
    }
  }

  const postList = postData.map(mapPost)
  postList.map((post) => genCate(categoryMap, 'categories', post))
  postList.map((post) => genCate(tagMap, 'tags', post))

  if (options.categories) {
    if (categoryMap.size) {
      writeData.push({
        path: 'static/categories.json',
        data: [...categoryMap.values()].map(mapTags)
      })

      writeData = writeData.concat([...categoryMap.values()].map(mapTag))
    }
  }

  if (options.tags) {
    if (tagMap.size) {
      writeData.push({
        path: 'static/tags.json',
        data: [...tagMap.values()].map(mapTags)
      })

      writeData = writeData.concat([...tagMap.values()].map(mapTag))
    }
  }

  if (options.posts_size > 0) {
    const pagePosts = []
    const len = postList.length
    const pageSize = options.posts_size
    const pageCount = Math.ceil(len / pageSize)

    for (let i = 0; i < postList.length; i += pageSize) {
      pagePosts.push({
        path: 'static/posts/' + Math.ceil((i + 1) / pageSize) + '.json',
        data: {
          total: len,
          pageSize: pageSize,
          pageCount: pageCount,
          data: postList.slice(i, i + pageSize)
        }
      })
    }

    writeData.push({
      path: 'static/posts.json',
      data: pagePosts[0].data
    })

    writeData = writeData.concat(pagePosts)
  } else {
    writeData.push({
      path: 'static/posts/1.json',
      data: {
        total: postList.length,
        pageSize: postList.length,
        pageCount: 1,
        data: postList
      }
    })
  }

  if (options.post) {
    writeData.concat(postList.map((post) => {
      const path = 'static/articles/' + post.slug + '.json'
      return {
        path: path,
        data: post
      }
    }))
  }
  debug(writeData)
  return writeData
}

function MarkdownPlugin(options = {}) {
  options.from = options.from || 'source'
  options.to = options.to || 'database'
  options.debug = options.debug || 'debug'
  if (options.debug === true) {
    options.debug = 'info'
  }
  const debugLevels = ['warning', 'info', 'debug']
  const debugLevelIndex = debugLevels.indexOf(options.debug)
  function log(msg, level) {
    if (level === 0) {
      msg = `WARNING - ${msg}`
    } else {
      level = level || 1
    }
    if (level <= debugLevelIndex) {
      console.log('[markdown-webpack-plugin] ' + msg)
    }
  }
  function warning(msg) {
    log(msg, 0)
  }
  function info(msg) {
    log(msg, 1)
  }
  function debug(msg) {
    log(msg, 2)
  }

  const apply = (compiler) => {
    let fileDependencies
    let contextDependencies
    const written = {}
    let context
    if (!options.context) {
      context = compiler.options.context
    } else if (!path.isAbsolute(options.context)) {
      context = path.join(compiler.options.context, options.context)
    } else {
      context = options.context
    }

    const emit = (compilation, cb) => {
      debug('starting emit')
      const callback = () => {
        debug('finishing emit')
        cb()
      }

      fileDependencies = []
      contextDependencies = []
      const globalRef = {
        info,
        debug,
        warning,
        compilation,
        written,
        fileDependencies,
        contextDependencies,
        context,
        sourceDir: path.join(context, options.from),
        inputFileSystem: compiler.inputFileSystem,
        output: compiler.options.output.path,
        ignore: options.ignore || [],
        copyUnmodified: options.copyUnmodified,
        concurrency: options.concurrency,
        posts: [],
        categories: [],
        tags: [],
        options: options
      }

      const limit = pLimit(globalRef.concurrency || 100)
      const postDir = path.resolve(globalRef.sourceDir, 'posts')
      globby('**/*.md', {
        expandDirectories: true,
        cwd: postDir
      })
        .then((paths) => Promise.all(paths.map((from) => limit(() => {
          const contextPath = path.dirname(path.resolve(path.resolve(from)))
          const postPath = path.join(postDir, from)
          const file = {
            from: postPath,
            to: globalRef.output
          }

          if (globalRef.contextDependencies.indexOf(contextPath) === -1) {
            globalRef.contextDependencies.push(contextPath)
          }
          debug(`found ${from}`)
          return processMarkdown(globalRef, file)
        }))))
        .then((posts) => processData(globalRef, posts))
        .then((writeData) => writeFile(compilation, writeData, globalRef.output))
        .then(() => callback())
        .catch(err => {
          console.log(err)
          compilation.errors.push(err)
        })
    }

    const afterEmit = (compilation, cb) => {
      debug('starting after-emit')
      const callback = () => {
        debug('finishing after-emit')
        cb()
      }

      let compilationFileDependencies
      let addFileDependency
      if (Array.isArray(compilation.fileDependencies)) {
        compilationFileDependencies = new Set(compilation.fileDependencies)
        addFileDependency = (file) => compilation.fileDependencies.push(file)
      } else {
        compilationFileDependencies = compilation.fileDependencies
        addFileDependency = (file) => compilation.fileDependencies.add(file)
      }

      let compilationContextDependencies
      let addContextDependency
      if (Array.isArray(compilation.contextDependencies)) {
        compilationContextDependencies = new Set(compilation.contextDependencies)
        addContextDependency = (file) => compilation.contextDependencies.push(file)
      } else {
        compilationContextDependencies = compilation.contextDependencies
        addContextDependency = (file) => compilation.contextDependencies.add(file)
      }

      // Add file dependencies if they're not already tracked
      for (const file of fileDependencies) {
        if (compilationFileDependencies.has(file)) {
          debug(`not adding ${file} to change tracking, because it's already tracked`)
        } else {
          debug(`adding ${file} to change tracking`)
          addFileDependency(file)
        }
      }

      // Add context dependencies if they're not already tracked
      for (const context of contextDependencies) {
        if (compilationContextDependencies.has(context)) {
          debug(`not adding ${context} to change tracking, because it's already tracked`)
        } else {
          debug(`adding ${context} to change tracking`)
          addContextDependency(context)
        }
      }

      callback()
    }

    if (compiler.hooks) {
      const plugin = { name: 'MarkdownPlugin' }

      compiler.hooks.emit.tapAsync(plugin, emit)
      compiler.hooks.afterEmit.tapAsync(plugin, afterEmit)
    } else {
      compiler.plugin('emit', emit)
      compiler.plugin('after-emit', afterEmit)
    }
  }

  return {
    apply
  }
}

module.exports = MarkdownPlugin
