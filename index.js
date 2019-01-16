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

const feed_config_blog = CONFIG.feed
const feed_config_easto = {
    'generator': `easto ${EASTO_META.version} (https://github.com/thomaspuppe/easto)`
}
let feed_config = {...feed_config_blog, ...feed_config_easto};

let feed = new Feed.Feed(feed_config)

let counterDrafts = 0
let counterPosts = 0

LOG('Reading content directory')

let indexContent = ''
const templateForPost = fs.readFileSync(`${TEMPLATES_DIR}/post.html`, {
  encoding: 'utf-8'
})
const templateForIndexTeaser = fs.readFileSync(
  `${TEMPLATES_DIR}/index_teaser.html`,
  {
    encoding: 'utf-8'
  }
)

fs
  .readdirSync(`${CONTENT_DIR}`)
  .sort((a, b) => {
    return b.localeCompare(a)
  })
  .forEach(filename => {
    const filePath = `${CONTENT_DIR}/${filename}`
    LOG('- ' + filePath)

    const fileContent = fs.readFileSync(filePath, {
      encoding: 'utf-8'
    })

    let fileContentFrontmatter = yaml.loadFront(fileContent)

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
        LOG(`    - ${key}: ${fileContentFrontmatter[key]} (${typeof(fileContentFrontmatter[key])})`)
      const re = new RegExp('{{ META_' + key.toUpperCase() + ' }}', 'g')

      // TODO: this is starting to get dirty.
      // But it is a good use case for your easto talk: problems beyond the first step.
      if ( key === 'date') {
        const dateInMysqlFormat = fileContentFrontmatter[key].toISOString().substring(0, 10)
        targetContent = targetContent.replace(re, dateInMysqlFormat)
        teaserContent = teaserContent.replace(re, dateInMysqlFormat)
      } else if ( key === 'tags') {
        const tagsString = fileContentFrontmatter[key].join(', #')
        targetContent = targetContent.replace(re, tagsString)
        teaserContent = teaserContent.replace(re, tagsString)
      } else {
        targetContent = targetContent.replace(re, fileContentFrontmatter[key])
        teaserContent = teaserContent.replace(re, fileContentFrontmatter[key])
      }

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

    // TODO: naming things
    // TODO: more functional programming!
    for (var key in CONFIG) {
      const re = new RegExp('{{ BLOGMETA_' + key.toUpperCase() + ' }}', 'g')
      targetContent = targetContent.replace(re, CONFIG[key])
      teaserContent = teaserContent.replace(re, CONFIG[key])
    }

    const targetFilename =
      fileContentFrontmatter.permalink || filename.replace('.md', '')
    const targetPath = `${OUTPUT_DIR}/` + targetFilename
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

const indexTemplateContent = fs.readFileSync(`${TEMPLATES_DIR}/index.html`, {
  encoding: 'utf-8'
})
let indexTargetContent = indexTemplateContent.replace(
  '{{ CONTENT_BODY }}',
  indexContent
)

const indexTargetPath = `${OUTPUT_DIR}/index.html`
fs.writeFileSync(indexTargetPath, indexTargetContent)
LOG('  - wrote file: ' + indexTargetPath)

fs.mkdirSync(`${OUTPUT_DIR}/feed`) // TODO: was wenn das schon existiert?
fs.writeFileSync(`${OUTPUT_DIR}/feed/rss`, feed.rss2())
fs.writeFileSync(`${OUTPUT_DIR}/feed/atom`, feed.atom1())
fs.writeFileSync(`${OUTPUT_DIR}/feed/json`, feed.json1())
LOG('  - wrote feed files.')

ncp(`${TEMPLATES_DIR}/assets`, `${OUTPUT_DIR}/assets`, err => {
  if (err) return console.error(err)
  LOG('copied template assets')
})

// TODO: naming things
ncp(`${DATA_DIR}`, `${OUTPUT_DIR}`, err => {
  if (err) return console.error(err)
  LOG(`copied data files (images, downloads, static content) from "${DATA_DIR}" to "${OUTPUT_DIR}/"`)
})

// TODO: langsam könnte man auch mal aufteilen :-)

console.log(`Wrote ${counterPosts} posts and ${counterDrafts} drafts.`)
console.timeEnd('Easto')
