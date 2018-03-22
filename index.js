const fs = require('fs')
const marked = require('marked')

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

  const fileContentHtml = marked(fileContent)
  const targetContent = templateContent.replace(
    '{{ CONTENT_BODY }}',
    fileContentHtml
  )

  const targetPath = './output/' + filename.replace('.md', '.html')
  fs.writeFileSync(targetPath, targetContent)
  console.log('  - wrote file: ' + targetPath)
})
