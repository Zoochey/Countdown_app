/**
 * Minimal static host for Azure App Service (Linux/Windows).
 * Serves ./dist and falls back to index.html for client-side routes.
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const dist = path.join(__dirname, 'dist')
// Azure sets PORT; local default avoids privileged / reserved ports on Windows.
const port = Number(process.env.PORT || process.env.WEBSITES_PORT || 3456)

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

const distResolved = path.resolve(dist)

function sendFile(res, filePath) {
  const ext = path.extname(filePath)
  const type = mime[ext] || 'application/octet-stream'
  const stream = fs.createReadStream(filePath)
  stream.on('error', () => {
    sendSpa(res)
  })
  res.writeHead(200, { 'Content-Type': type })
  stream.pipe(res)
}

function sendSpa(res) {
  const indexPath = path.join(dist, 'index.html')
  fs.readFile(indexPath, (err, data) => {
    if (err) {
      res.writeHead(500)
      res.end('Zoochey: missing dist/index.html — run npm run build before deploy.')
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  if (urlPath === '/') urlPath = '/index.html'

  const filePath = path.resolve(path.join(dist, urlPath))
  if (!filePath.startsWith(distResolved)) {
    res.writeHead(403)
    res.end()
    return
  }

  fs.stat(filePath, (err, st) => {
    if (!err && st.isFile()) {
      sendFile(res, filePath)
      return
    }
    sendSpa(res)
  })
})

server.listen(port, () => {
  console.log(`Zoochey listening on ${port}`)
})
server.on('error', (err) => {
  console.error(err)
  process.exit(1)
})
