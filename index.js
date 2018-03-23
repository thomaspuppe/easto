const fs = require('fs')
const marked = require('marked')
const yaml = require('yaml-front-matter')

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

console.log('Reading content directory')

fs.readdirSync(`./${CONTENT_DIR}`).forEach(filename => {
  const filePath = `./${CONTENT_DIR}/${filename}`
  console.log('- ' + filePath)

  const fileContent = fs.readFileSync(filePath, {
    encoding: 'utf-8'
  })
  const templateContent = fs.readFileSync('./templates/layout.html', {
    encoding: 'utf-8'
  })

  var fileContentFrontmatter = yaml.loadFront(fileContent)

  const fileContentHtml = marked(fileContentFrontmatter.__content)
  let targetContent = templateContent.replace(
    '{{ CONTENT_BODY }}',
    fileContentHtml
  )

  for (var key in fileContentFrontmatter) {
    targetContent = targetContent.replace(
      '{{ META_' + key.toUpperCase() + ' }}',
      fileContentFrontmatter[key]
    )
  }

  const targetPath = `./${OUTPUT_DIR}/` + filename.replace('.md', '.html')
  fs.writeFileSync(targetPath, targetContent)
  console.log('  - wrote file: ' + targetPath)
})
