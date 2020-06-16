#!/usr/local/bin/python3.7m

from random import randint 

nodes = []

with open("route.txt", 'r') as routes:
    for route in routes:
        lat, lon = route.strip().split(', ')
        nodes.append(f'{{"id":"ambulance69","lat":{lat},"lon":{lon},"spd":{randint(50, 80)}}};\n')

with open("route.json", 'w') as json:
    json.writelines(nodes)

