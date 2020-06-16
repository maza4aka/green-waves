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

const assets = {
	test_vehicle: fs.readFileSync('view/assets/test_vehicle.gif')
}

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
		case '/assets/test_vehicle.gif':
			res.statusCode = 200;
			res.setHeader('Content-Type', 'image/gif');
			res.end(assets.test_vehicle);
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
		console.info(`[ws] connection with ${client} established!`);
	});

	ws.on('error', (error) => {
		console.info(`[ws] client from ${client} encountered error: ${JSON.stringify(error)}...`);
	});

	ws.on('close', (code, reason) => {
		console.info(`[ws] client from ${client} closed connection: code: ${code}, reason: ${reason}.`);
	});
});

server.on('error', err => {
	if (err.code === 'EACCESS') {
		console.error(`[http] no access to port ${config.port}!`);
	} else {
		console.error(`[http] unknown error: ${JSON.stringify(err)}.`);
	}
});

socket.on('error', err => {
	console.error(`[ws] unknown error: ${JSON.stringify(err)}.`);
});

server.listen(config.port, () => {
	console.info(`[http] listening on port ${config.port}...`);
});


/* interactions with firebase and clients */

firebase.initializeApp({
	credential: firebase.credential.cert(config.firebase),
	databaseURL: "https://green-wave-dummy.firebaseio.com"
});

let db = firebase.database()
	.ref("devices/vehicles");

let vehicles = {};

let lights = require('../lights.json');

setInterval(function() {
	for light in lights {
		if (light.active) {
			light.state = !light.state
		}
	}

	socket.clients.forEach(client => {
		clent.send(JSON.stringify({
			type: "light",
			data: light
		}))
	})
}, 13*1000)

function distance(_light, _vehicle) {
	// TODO measure distance between vehicle and light
}

db.on('child_added', function(snapshot) {
	const vehicle = snapshot.key;

	if (vehicles[vehicle])
		return;

	let telemetry = db.child(vehicle);

	telemetry.on('child_added', function(snapshot) {
		console.log(`[firebase] new data for '${vehicle}': ${JSON.stringify(snapshot.val())}.`);

		for light in lights {
			if (distance(light, snapshot.toJSON()) < 88) {
				light.state = true
				light.active = false
			} else {
				light.active = true
			}
		}

		socket.clients.forEach(client => {
			client.send(JSON.stringify(
				type: "telemetry",
				data: {
					id: vehicle,
					telemetry: snapshot.toJSON()
				}
			}));
		});
	});

	vehicles[vehicle] = telemetry;
});
