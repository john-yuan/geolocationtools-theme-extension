const fs = require('fs')
const path = require('path')
const JSON5 = require('json5')
const codes = fs
  .readdirSync(path.resolve(__dirname, 'public/flags'))
  .map((name) => name.replace(/\.svg$/i, ''))

const ts = `export const COUNTRY_CODES = '` + codes.join(',') + `'.split(',')\n`

fs.mkdirSync(path.resolve(__dirname, 'src/data'), { recursive: true })
fs.writeFileSync(path.resolve(__dirname, 'src/data/countryCodes.ts'), ts)
