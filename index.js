console.time('🚀 Easto')

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

const EASTO_META = JSON.parse(fs.readFileSync('./package.json'), 'utf8');
const CONFIG = JSON.parse(fs.readFileSync(args.get('config'), 'utf8'));

const CONTENT_DIR = CONFIG.content_dir || 'content'
const OUTPUT_DIR = CONFIG.output_dir || output
const TEMPLATES_DIR = CONFIG.templates_dir || 'templates'
const DATA_DIR = CONFIG.data_dir || 'data'

const VERBOSE = args.get('verbose')

const LOG = str => {
  if (VERBOSE) console.log(str)
}

const eval_template = (s, params) => {
  return Function(...Object.keys(params), "return " + s)
  (...Object.values(params))
}

const feed_config_blog = CONFIG.feed
// TODO: fix version which is 2.0 in output, but 0.7 in package.json!?!
const feed_config_easto = {
    'generator': `easto ${EASTO_META.version} (https://github.com/thomaspuppe/easto)`
}
let feed_config = {...feed_config_blog, ...feed_config_easto};

let feed = new Feed.Feed(feed_config)

let counterDrafts = 0
let counterPosts = 0

LOG('Reading content directory')

let indexContent = ''
const templateForPost = fs.readFileSync(`${TEMPLATES_DIR}/post.html`, 'utf-8')
const templateForIndexTeaser = fs.readFileSync(`${TEMPLATES_DIR}/index_teaser.html`, 'utf-8')


fs
  .readdirSync(CONTENT_DIR) // TODO: nur die Variable hier rein!
  .sort((a, b) => {
    return b.localeCompare(a)
  })
  .forEach(filename => {
    const filePath = `${CONTENT_DIR}/${filename}`
    LOG('- ' + filePath)

    const fileContent = fs.readFileSync(filePath, 'utf-8')

    let fileContentFrontmatter = yaml.loadFront(fileContent)

    const fileContentHtml = marked.parse(fileContentFrontmatter.__content)

    const feedItem = {
      title: fileContentFrontmatter['title'],
      description: fileContentFrontmatter['description'],
      date: fileContentFrontmatter['date'],
      content: fileContentHtml
    }

    // TODO: naming things!
    fileContentFrontmatter['date'] = fileContentFrontmatter['date'].toISOString().substring(0, 10)

    const teaserContent = eval_template(templateForIndexTeaser, {
        'blogmeta': CONFIG,
        'meta': fileContentFrontmatter
    })

    const targetContent = eval_template(templateForPost, {
        'blogmeta': CONFIG,
        'meta': fileContentFrontmatter,
        'content': fileContentHtml
    })

    const targetFilename =
      fileContentFrontmatter.permalink || filename.replace('.md', '')
    const targetPath = `${OUTPUT_DIR}/` + targetFilename
    // OPTIMIZE: Async writing
    fs.writeFileSync(targetPath, targetContent)
    LOG('  - wrote file: ' + targetPath)

    feedItem.link = `${CONFIG.baseurl}${targetFilename}`
    feedItem.id = `${CONFIG.baseurl}${targetFilename}`

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

const indexTemplateContent = fs.readFileSync(`${TEMPLATES_DIR}/index.html`, 'utf-8')
const indexTargetContent = eval_template(indexTemplateContent, {
    'content': indexContent
})

const indexTargetPath = `${OUTPUT_DIR}/index.html`
fs.writeFileSync(indexTargetPath, indexTargetContent)
LOG('  - wrote file: ' + indexTargetPath)

fs.mkdirSync(`${OUTPUT_DIR}/feed`) // TODO: was wenn das schon existiert?
fs.writeFileSync(`${OUTPUT_DIR}/feed/rss`, feed.rss2())
fs.writeFileSync(`${OUTPUT_DIR}/feed/atom`, feed.atom1())
fs.writeFileSync(`${OUTPUT_DIR}/feed/json`, feed.json1())
LOG('  - wrote feed files.')

// TODO: wird Zeit, das in Module auszulagern
// TODO: Feed wird das nicht können. Also XML-Lib oder selber json2xml
/*
let sitemap = new Feed.Feed()
sitemap.addItem(sitemapItem)

<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!-- created with Free Online Sitemap Generator www.xml-sitemaps.com -->


<url>
  <loc>https://blog.thomaspuppe.de/</loc>
  <lastmod>2019-01-15T22:46:34+00:00</lastmod>
  <priority>1.00</priority>
</url> */


ncp(`${TEMPLATES_DIR}/assets`, `${OUTPUT_DIR}/assets`, err => {
  if (err) return console.error(err)
  LOG('copied template assets')
})

// TODO: naming things
ncp(DATA_DIR, OUTPUT_DIR, err => {
  if (err) return console.error(err)
  LOG(`copied data files (images, downloads, static content) from "${DATA_DIR}" to "${OUTPUT_DIR}/"`)
})

// TODO: langsam könnte man auch mal aufteilen :-)

console.log(`Wrote ${counterPosts} posts and ${counterDrafts} drafts.`)
console.timeEnd('🚀 Easto')
