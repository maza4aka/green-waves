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

/* lights update */

let lights = {};

function createLight(data) {
    if (data.state) {
        let greenLightIcon = L.icon({
		    iconUrl: 'assets/green-light.png',
		    iconSize: [20, 20],
		    iconAnchor: [10, 10],
		    popupAnchor: [0, 0]
	    });

        let green_light = new L.Marker([data.lat, data.lon],{
		    icon: greenLightIcon,
		    rotationAngle: 0,
		    rotationOrigin: "top center",
	    });

	    green_light.addTo(map);
	    lights[data.id] = green_light;
    } else {
        let redLightIcon = L.icon({
		    iconUrl: 'assets/red-light.png',
		    iconSize: [20, 20],
		    iconAnchor: [10, 10],
		    popupAnchor: [0, 0]
	    });

        let red_light = new L.Marker([data.lat, data.lon],{
		    icon: redLightIcon,
		    rotationAngle: 0,
		    rotationOrigin: "top center",
	    });

	    red_light.addTo(map);
	    lights[data.id] = red_light;
    }
}

function updateLight(data) {
    if (data.state) {
        let greenLightIcon = L.icon({
		    iconUrl: 'assets/green-light.png',
		    iconSize: [20, 20],
		    iconAnchor: [10, 10],
		    popupAnchor: [0, 0]
	    });
        
        lights[data.id].setIcon(greenLightIcon);
    } else { 
        let redLightIcon = L.icon({
		    iconUrl: 'assets/red-light.png',
		    iconSize: [20, 20],
		    iconAnchor: [10, 10],
		    popupAnchor: [0, 0]
	    });

        lights[data.id].setIcon(redLightIcon);
    }
}

function tlState(data) {
	console.log(data);

	if (lights[data.id]) {
		updateLight(data);
	} else {
		createLight(data);
	}
}

/* interaction with server */

const socket = new WebSocket("ws://" + window.location.hostname);

socket.onopen = function connection(event) {
	console.info(`[client] connected to the server: ${JSON.stringify(event)}!`);
};

socket.onmessage = function incoming(event) {
	console.log(`[server] incoming message: ${JSON.stringify(event)}.`);

	let payload = JSON.parse(event.data);

	if (payload.type == "telemetry") {
		telemetry(payload.data);
	} else if (payload.type == "light") {
		tlState(payload.data);
	}
};

socket.onerror = function connection(event) {
	console.error(`[client] unknown socket error: ${JSON.stringify(event)}...`);
};

socket.onclose = function connection(event) {
	console.info(`[client] connection closed: ${JSON.stringify(event)}.`);
};
