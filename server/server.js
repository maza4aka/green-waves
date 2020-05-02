'use strict'


const fs = require('fs');

const firebase = require('firebase-admin');

const http = require('http');
const ws = require('ws');


/* configs, etc. */

const config = {
	port: 80,
	firebase: require("../cloud/green-wave-dummy-firebase-adminsdk-45hoa-377eaabdce.json")
};


/* http, ws, routing, resources, etc. */

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
	const client = req.socket.remoteAddress;

	console.log(`[ws] client connected: ${client}.`);

	ws.on('open', () => {
		console.log(`[ws] connection with ${client} established!`);
	});

	ws.on('error', (error) => {
		console.log(`[ws] client from ${client} encountered error: ${JSON.stringify(error)}...`);
	});

	ws.on('close', (code, reason) => {
		console.log(`[ws] client from ${client} closed connection: code: ${code}, reason: ${reason}.`);
	});
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


/* interactions with firebase and clients */

firebase.initializeApp({
	credential: firebase.credential.cert(config.firebase),
	databaseURL: "https://green-wave-dummy.firebaseio.com"
});

let db = firebase.database()
	.ref("devices/vehicles");

let vehicles = new Map();

db.on('child_added', function(snapshot) {
	const vehicle = snapshot.key;

	if (vehicle in vehicles)
		return;

	let telemetry = db.child(vehicle);

	telemetry.on('child_added', function(snapshot) {
		console.log(`[firebase] new data for '${vehicle}': ${JSON.stringify(snapshot.val())}.`);

		socket.clients.forEach(client => {
			client.send(JSON.stringify({
				id: vehicle,
				telemetry: snapshot.toJSON()
			}));
		});
	});

	vehicles.set(vehicle, telemetry);
});