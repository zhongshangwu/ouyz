const fs = require('fs')
const path = require('path')

const stat = (inputFileSystem, path) => {
  return new Promise((resolve, reject) => {
    inputFileSystem.stat(path, (err, stats) => {
      if (err) {
        reject(err)
      }
      resolve(stats)
    })
  })
}

const readFile = (inputFileSystem, path) => {
  return new Promise((resolve, reject) => {
    inputFileSystem.readFile(path, (err, stats) => {
      if (err) {
        reject(err)
      }
      resolve(stats)
    })
  })
}

const writeFile = (compilation, writeData, context) => {
  for (const file of writeData) {
    console.log(`writing to database dir: ${path.join(context, file.path)}`)
    const content = JSON.stringify(file.data)

    const from = path.join(context, file.path)
    try {
      fs.mkdirSync(path.dirname(path.resolve(from)))
    } catch (e) {}

    fs.writeFileSync(
      path.join(context, file.path),
      content
    )
    // compilation.assets[file.path] = {
    //   size: function () {
    //     return content.length
    //   },
    //   source: function() {
    //     return new Buffer(content)
    //   }
    // }
  }
}

function extractTitle(markup) {
  const matches = /<h1[^>]*>([^<]*)<\/h1>/.exec(markup)
  if (!matches) return markup
  return matches[1]
}

function extractExcerpt(markup) {

}

module.exports = { stat, readFile, writeFile, extractTitle, extractExcerpt }
