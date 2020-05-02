const map = L.map('map_view').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const socket = new WebSocket("ws://" + window.location.hostname);

socket.onopen = function connection(event) {
	console.log(`[client] connected to the server: ${JSON.stringify(event)}!`);
};

socket.onmessage = function incoming(event) {
	console.log(`[server] incoming message: ${JSON.stringify(event)}.`);
};

socket.onerror = function connection(event) {
	console.log(`[client] unknown socket error: ${JSON.stringify(event)}...`);
};

socket.onclose = function connection(event) {
	console.log(`[client] connection closed: ${JSON.stringify(event)}.`);
};
