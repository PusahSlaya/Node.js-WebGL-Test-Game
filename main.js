const http = require('http')
const port = 80
const fs = require('fs')
const zlib = require('zlib')
const debug = true
const url = require('url')
const game = require('./game')

// https://www.npmjs.com/package/serialize-javascript
const serialize = require('serialize-javascript')

/** @param {string} serialized */
function deserialize(serialized){
   return eval('(' + serialized + ')');
}

const redirectTable = {
    '' : 'index.html'
}
var whiteList = ['']

fs.readFile('whitelist.txt', function(err, data){
    if (err) return console.log('Failed to read whitelist.txt', err)
    else whiteList = deserialize(data.toString())
    if (debug) console.log('whiteList = ' + serialize(whiteList))
})

http.createServer( function (req, res) {  
    console.log(req.url)
    var pathname = url.parse(req.url).pathname.substr(1)

    if (redirectTable[pathname]) pathname = redirectTable[pathname]
    
    if (!whiteList.includes(pathname)) {
        if (debug) console.log('illegal resource access attempt: ' + pathname)
        res.writeHead(403, {'Content-Type': 'text/html'}) // 403 restricted
        res.end()
    } else fs.readFile(pathname, function (err, data) {
       if (err) {
          console.log(err)
          res.writeHead(404, {'Content-Type': 'text/html'}) // 404 not found
       } else {
          res.writeHead(200, {'Content-Type':
            (pathname.endsWith('.css')) ? 'text/css' : 'text/html'}) // 200 found
          res.write(data.toString())
       }
       res.end()
    })

 }).listen(port)

