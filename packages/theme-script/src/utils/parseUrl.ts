export function parseUrl(url: string) {
  const arr = url.replace(/^(([0-9a-zA-Z]+:)?\/\/)?/, '').split('/')
  const domain = arr.shift() || ''
  return {
    domain,
    locale: arr[0] || ''
  }
}
