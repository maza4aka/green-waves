'use strict'

const fs = require('fs');

const http = require('http');
const ws = require('ws');

const config = {
	port: 80
};

// const favicon = fs.readFileSync('../favicon.png');

const index = {
	html: fs.readFileSync('view/index.html', 'utf8'),
	css: fs.readFileSync('view/index.css', 'utf8'),
	js: fs.readFileSync('view/index.js', 'utf8')
};

const server = http.createServer((req, res) => {
	switch(req.url) {
		case '/':
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/html');
			res.end(index.html);
			break;
		case '/view/index.css':
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/css');
			res.end(index.css);
			break;
		case '/view/index.js':
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/javascript');
			res.end(index.js);
			break;
		default:
			res.statusCode = 404;
			res.setHeader('Content-Type', 'text/plain');
			res.end('Not found.');
	}
});

const socket = new ws.Server({
	server, clientTracking: true
});

socket.on('connection', function connection(ws, req) {
	console.log(`[ws] client connected: ${req.socket.remoteAddress}.`);
});

server.on('error', err => {
	if (err.code === 'EACCESS') {
		console.log(`[http] no access to port ${config.port}!`);
	} else {
		console.log(`[http] unknown error: ${JSON.stringify(err)}.`);
	}
});

socket.on('error', err => {
	console.log(`[ws] unknown error: ${JSON.stringify(err)}.`);
});

server.listen(config.port, () => {
	console.log(`[http] listening on port ${config.port}...`);
});
