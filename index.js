const fs = require('fs')

console.log('Hello World')
console.log('Reading content directory')

fs.readdirSync('./content').forEach(function(filename) {
  const filePath = './content/' + filename
  console.log('- ' + filePath)
})
