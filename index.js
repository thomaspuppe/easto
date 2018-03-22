const fs = require('fs')
const marked = require('marked')
const yaml = require('yaml-front-matter')

console.log('Reading content directory')

fs.readdirSync('./content').forEach(filename => {
  const filePath = './content/' + filename
  console.log('- ' + filePath)

  const fileContent = fs.readFileSync(filePath, {
    encoding: 'utf-8'
  })
  const templateContent = fs.readFileSync('./templates/layout.html', {
    encoding: 'utf-8'
  })

  // Split Metadata from Body
  // const fileContentSplitted = fileContent.split('---')
  // const fileContentMeta = fileContentSplitted[0]
  // const fileContentBody = fileContentSplitted[1]

  var fileContentFrontmatter = yaml.loadFront(fileContent)

  const fileContentHtml = marked(fileContentFrontmatter.__content)
  const targetContent = templateContent
    .replace('{{ CONTENT_BODY }}', fileContentHtml)
    .replace('{{ META_TITLE }}', fileContentFrontmatter.title)

  const targetPath = './output/' + filename.replace('.md', '.html')
  fs.writeFileSync(targetPath, targetContent)
  console.log('  - wrote file: ' + targetPath)
})
