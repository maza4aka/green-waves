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
	test_vehicle: fs.readFileSync('view/assets/test_vehicle.gif'),
    green_light: fs.readFileSync('view/assets/green-light.png'),
    red_light: fs.readFileSync('view/assets/red-light.png')
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
        case '/assets/green-light.png':
			res.statusCode = 200;
			res.setHeader('Content-Type', 'image/png');
			res.end(assets.green_light);
			break;
        case '/assets/red-light.png':
			res.statusCode = 200;
			res.setHeader('Content-Type', 'image/png');
			res.end(assets.red_light);
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

lights.forEach(light => {
		light.id = lights.indexOf(light)
	}
)

setInterval(function() {
	lights.forEach(light => {
			if (light.active) {
				light.state = !light.state
			}
		}
	)

	socket.clients.forEach(client => {
		lights.forEach(light => {
				client.send(JSON.stringify({
					type: "light",
					data: light
				}))
			}
		)
	})
}, 13*1000)

function distance(_light, _vehicle) {
	let R = 6378.137
    let dLat = _light.lat * Math.PI / 180 - _vehicle.lat * Math.PI / 180
    let dLon = _light.lon * Math.PI / 180 - _vehicle.lon * Math.PI / 180
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(_vehicle.lat * Math.PI / 180) * Math.cos(_light.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    let d = R * c
    return d * 1000
}

db.on('child_added', function(snapshot) {
	const vehicle = snapshot.key;

	if (vehicles[vehicle])
		return;

	let telemetry = db.child(vehicle);

	telemetry.on('child_added', function(snapshot) {
		console.log(`[firebase] new data for '${vehicle}': ${JSON.stringify(snapshot.val())}.`);

		lights.forEach(light => {
			if (distance(light, snapshot.toJSON()) < 33) {
				light.state = true
				light.active = false

				socket.clients.forEach(client => {
					client.send(JSON.stringify({
						type: "light",
						data: light
					}))
				})
			} else {
				light.active = true
			}
		})

		socket.clients.forEach(client => {
			client.send(JSON.stringify({
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
