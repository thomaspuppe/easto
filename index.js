console.time('Easto')

const fs = require('fs')
const marked = require('marked')
const yaml = require('yaml-front-matter')
const ncp = require('ncp').ncp

// TODO: Optimize this! Wozu hamma denn deconstruction, map, usw?
let args = new Map()
process.argv.forEach(function(val) {
  if (val.startsWith('--')) {
    val = val.slice(2)
    if (val.indexOf('=') > -1) {
      const valArray = val.split('=')
      args.set(valArray[0], valArray[1])
    }
  }
})

const CONTENT_DIR = args.get('content') || 'content'
const OUTPUT_DIR = args.get('output') || 'output'
const TEMPLATES_DIR = args.get('templates') || 'templates'
const VERBOSE = args.get('verbose')

const LOG = str => {
  if (VERBOSE) console.log(str)
}

LOG('Reading content directory')

fs.readdirSync(`./${CONTENT_DIR}`).forEach(filename => {
  const filePath = `./${CONTENT_DIR}/${filename}`
  LOG('- ' + filePath)

  const fileContent = fs.readFileSync(filePath, {
    encoding: 'utf-8'
  })
  const templateContent = fs.readFileSync(`./${TEMPLATES_DIR}/layout.html`, {
    encoding: 'utf-8'
  })

  var fileContentFrontmatter = yaml.loadFront(fileContent)

  const fileContentHtml = marked(fileContentFrontmatter.__content)
  let targetContent = templateContent.replace(
    '{{ CONTENT_BODY }}',
    fileContentHtml
  )

  for (var key in fileContentFrontmatter) {
    const re = new RegExp('{{ META_' + key.toUpperCase() + ' }}', 'g')
    targetContent = targetContent.replace(re, fileContentFrontmatter[key])
  }

  const targetPath = `./${OUTPUT_DIR}/` + filename.replace('.md', '.html')
  fs.writeFileSync(targetPath, targetContent)
  LOG('  - wrote file: ' + targetPath)
})

ncp('./templates/static', './output/static', err => {
  if (err) return console.error(err)
  LOG('copied static template files (aka assets)')
})

console.timeEnd('Easto')
