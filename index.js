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
const DATA_DIR = args.get('data') || 'data'
const VERBOSE = args.get('verbose')

const LOG = str => {
  if (VERBOSE) console.log(str)
}

let counterDrafts = 0
let counterPosts = 0

LOG('Reading content directory')

let indexContent = ''
const templateForPost = fs.readFileSync(`./${TEMPLATES_DIR}/post.html`, {
  encoding: 'utf-8'
})
const templateForIndexTeaser = fs.readFileSync(
  `./${TEMPLATES_DIR}/index_teaser.html`,
  {
    encoding: 'utf-8'
  }
)

fs
  .readdirSync(`./${CONTENT_DIR}`)
  .sort((a, b) => {
    return b.localeCompare(a)
  })
  .forEach(filename => {
    const filePath = `./${CONTENT_DIR}/${filename}`
    LOG('- ' + filePath)

    const fileContent = fs.readFileSync(filePath, {
      encoding: 'utf-8'
    })

    var fileContentFrontmatter = yaml.loadFront(fileContent)

    const fileContentHtml = marked(fileContentFrontmatter.__content)
    let targetContent = templateForPost.replace(
      '{{ CONTENT_BODY }}',
      fileContentHtml
    )

    let teaserContent = templateForIndexTeaser

    LOG('  - Meta data:')
    for (var key in fileContentFrontmatter) {
      if (key !== '__content')
        LOG(`    - ${key}: ${fileContentFrontmatter[key]}`)
      const re = new RegExp('{{ META_' + key.toUpperCase() + ' }}', 'g')
      targetContent = targetContent.replace(re, fileContentFrontmatter[key])
      teaserContent = teaserContent.replace(re, fileContentFrontmatter[key])
    }

    const targetFilename =
      fileContentFrontmatter.permalink || filename.replace('.md', '')
    const targetPath = `./${OUTPUT_DIR}/` + targetFilename
    fs.writeFileSync(targetPath, targetContent)
    LOG('  - wrote file: ' + targetPath)

    // TODO: this is not about _any website_, but about _my blog_ ... decide what Easto will be!
    // OPTIMIZE: dont replace if you dont output
    if (fileContentFrontmatter['draft']) {
      counterDrafts++
    } else {
      indexContent += teaserContent
      counterPosts++
    }
  })

const indexTemplateContent = fs.readFileSync(`./${TEMPLATES_DIR}/index.html`, {
  encoding: 'utf-8'
})
let indexTargetContent = indexTemplateContent.replace(
  '{{ CONTENT_BODY }}',
  indexContent
)

const indexTargetPath = `./${OUTPUT_DIR}/index.html`
fs.writeFileSync(indexTargetPath, indexTargetContent)
LOG('  - wrote file: ' + indexTargetPath)

ncp(`./${TEMPLATES_DIR}/assets`, `./${OUTPUT_DIR}/assets`, err => {
  if (err) return console.error(err)
  LOG('copied template assets')
})

// TODO: naming things
ncp(`./${DATA_DIR}`, `./${OUTPUT_DIR}`, err => {
  if (err) return console.error(err)
  LOG(`copied data files (images, downloads, static content) from "./${DATA_DIR}" to "./${OUTPUT_DIR}/"`)
})

console.log(`Wrote ${counterPosts} posts and ${counterDrafts} drafts.`)
console.timeEnd('Easto')
