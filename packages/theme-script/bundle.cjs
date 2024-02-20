const fs = require('fs')
const path = require('path')

const TEMPLATE = `(function(v){if(typeof document!=='undefined'&&document.head){var s=document.createElement('style');s.setAttribute('type', 'text/css');s.appendChild(document.createTextNode(v));document.head.appendChild(s)}})(__CSS__);`

const TEMPLATE_JS = `(function(){__JS__})();`

function read(filename) {
  return fs.readFileSync(path.resolve(__dirname, filename)).toString()
}

function write(filename, content) {
  return fs.writeFileSync(path.resolve(__dirname, filename), content)
}

function build() {
  const js = TEMPLATE_JS.replace('__JS__', () => {
    const code = read('dist/assets/index.js')
    return code.endsWith(';') ? code : code + ';'
  })
  const cssCode = TEMPLATE.replace('__CSS__', () => {
    return JSON.stringify(read('dist/assets/index.css').trim())
  })
  const bundleJs = cssCode + '\n' + js
  const jsSize = +(js.length / 1024).toFixed(2)
  const bundleSize = +(bundleJs.length / 1024).toFixed(2)

  write('dist/assets/bundle.js', js)
  write('dist/assets/bundle-with-css.js', bundleJs)

  console.log(`Saved dist/assets/bundle.js (${jsSize} kB)`)
  console.log(`Saved dist/assets/bundle-with-css.js (${bundleSize} kB)`)
  console.log('')

  fs.unlinkSync(path.resolve(__dirname, 'dist/assets/index.tmp.js'))
}

build()
