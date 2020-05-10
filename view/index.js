const map = L.map('map_view').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


/* vehicle rendering? */

let vehicles = {};

function createVehicle(data) {
	let vehicleIcon = L.icon({
		iconUrl: 'assets/test_vehicle.gif',
		iconSize: [35, 35],
		iconAnchor: [17.5, 17.5],
		popupAnchor: [0, 0]
	});

	let vehicle = new L.Marker([data.telemetry.lat, data.telemetry.lon],{
		icon: vehicleIcon,
		rotationAngle: 0,
		rotationOrigin: "top center",
	});

	vehicle.addTo(map);
	vehicles[data.id] = vehicle;
}

function updateVehicle(data) {
	let lat = data.telemetry.lat;
	let lon = data.telemetry.lon;
	let newPosition = new L.LatLng(lat, lon);

	vehicles[data.id].setLatLng(newPosition);
}

function telemetry(data) {
	console.log(data);

	if (vehicles[data.id]) {
		updateVehicle(data);
	} else {
		createVehicle(data);
	}
}


/* interaction with server */

const socket = new WebSocket("ws://" + window.location.hostname);

socket.onopen = function connection(event) {
	console.info(`[client] connected to the server: ${JSON.stringify(event)}!`);
};

socket.onmessage = function incoming(event) {
	console.log(`[server] incoming message: ${JSON.stringify(event)}.`);

	let data = JSON.parse(event.data);

	telemetry(data);
};

socket.onerror = function connection(event) {
	console.error(`[client] unknown socket error: ${JSON.stringify(event)}...`);
};

socket.onclose = function connection(event) {
	console.info(`[client] connection closed: ${JSON.stringify(event)}.`);
};
