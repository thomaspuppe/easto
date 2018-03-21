const fs = require('fs')

console.log('Reading content directory')

fs.readdirSync('./content').forEach(filename => {
  const filePath = './content/' + filename
  console.log('- ' + filePath)

  const fileContent = fs.readFileSync(filePath)
  const templateContent = fs.readFileSync('./templates/layout.html', {
    encoding: 'utf-8'
  })
  const targetContent = templateContent.replace(
    '{{ CONTENT_BODY }}',
    fileContent
  )

  const targetPath = './output/' + filename.replace('.md', '.html')
  fs.writeFileSync(targetPath, targetContent)
  console.log('  - wrote file: ' + targetPath)
})
