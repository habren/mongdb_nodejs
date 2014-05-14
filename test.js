var http=require('http');
http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write('abc\n');
	res.end('Hello Node.js\n');
}).listen(8080, "9.123.197.164");
console.log('Server started');
