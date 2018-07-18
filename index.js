console.time('Easto')

const Feed = require('feed')
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

// TODO: this must come from the blog, not easto!
let feed = new Feed({
  title: 'Blog von Thomas Puppe, Web Developer.',
  //description: 'This is my personal feed!',
  id: 'https://blog.thomaspuppe.de',
  link: 'https://blog.thomaspuppe.de',
  //image: 'http://example.com/image.png',
  //favicon: 'http://example.com/favicon.ico',
  copyright: 'All rights reserved 2018, Thomas Puppe',
  //updated: new Date(2013, 06, 14), // optional, default = today
  generator: 'easto 0.6.0 (https://github.com/thomaspuppe/easto)',
  feedLinks: {
    json: 'https://blog.thomaspuppe.de/feed/json',
    atom: 'https://blog.thomaspuppe.de/feed/atom',
    rss: 'https://blog.thomaspuppe.de/feed/rss',
  },
  author: {
    name: 'Thomas Puppe',
    email: 'info@thomaspuppe.de',
    link: 'https://www.thomaspuppe.de'
  }
})

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

    const feedItem = {
    	content: fileContentHtml
    }

    LOG('  - Meta data:')
    for (var key in fileContentFrontmatter) {
      if (key !== '__content')
        LOG(`    - ${key}: ${fileContentFrontmatter[key]}`)
      const re = new RegExp('{{ META_' + key.toUpperCase() + ' }}', 'g')
      targetContent = targetContent.replace(re, fileContentFrontmatter[key])
      teaserContent = teaserContent.replace(re, fileContentFrontmatter[key])

      if ( key === 'title' ) {
      	feedItem.title = fileContentFrontmatter[key];
      }

      if ( key === 'description' ) {
      	feedItem.description = fileContentFrontmatter[key];
      }

      if ( key === 'date' ) {
      	feedItem.date = fileContentFrontmatter[key];
      }
    }

    const targetFilename =
      fileContentFrontmatter.permalink || filename.replace('.md', '')
    const targetPath = `./${OUTPUT_DIR}/` + targetFilename
    fs.writeFileSync(targetPath, targetContent)
    LOG('  - wrote file: ' + targetPath)

    feedItem.link = `https://blog.thomaspuppe.de/${targetFilename}`
    feedItem.id = `https://blog.thomaspuppe.de/${targetFilename}`

    // TODO: this is not about _any website_, but about _my blog_ ... decide what Easto will be!
    // OPTIMIZE: dont replace if you dont output
    if (fileContentFrontmatter['draft']) {
      counterDrafts++
    } else {
      feed.addItem(feedItem)
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

fs.mkdirSync(`./${OUTPUT_DIR}/feed`) // TODO: was wenn das schon existiert?
fs.writeFileSync(`./${OUTPUT_DIR}/feed/rss`, feed.rss2())
fs.writeFileSync(`./${OUTPUT_DIR}/feed/atom`, feed.atom1())
fs.writeFileSync(`./${OUTPUT_DIR}/feed/json`, feed.json1())
LOG('  - wrote feed files.')

ncp(`./${TEMPLATES_DIR}/assets`, `./${OUTPUT_DIR}/assets`, err => {
  if (err) return console.error(err)
  LOG('copied template assets')
})

// TODO: naming things
ncp(`./${DATA_DIR}`, `./${OUTPUT_DIR}`, err => {
  if (err) return console.error(err)
  LOG(`copied data files (images, downloads, static content) from "./${DATA_DIR}" to "./${OUTPUT_DIR}/"`)
})

// TODO: langsam könnte man auch mal aufteilen :-)

console.log(`Wrote ${counterPosts} posts and ${counterDrafts} drafts.`)
console.timeEnd('Easto')
