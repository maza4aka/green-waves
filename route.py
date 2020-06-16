#!/usr/local/bin/python3.7m


nodes = []

function randomInt(min, max) {
	return min + Math.floor((max - min) * Math.random());
}

with open("route.txt", 'r') as routes:
    for route in routes:
        lat, lon = route.strip().split(', ')
        nodes.append(f'{{"id":"ambulance69","lat":{lat},"lon":{lon},"spd":{randomInt(50, 80)}}};\n')

with open("route.json", 'w') as json:
    json.writelines(nodes)

