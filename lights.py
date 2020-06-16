#!/usr/local/bin/python3.7m


lights = []

with open("lights.txt", 'r') as lightz:
    for light in lightz:
        lat, lon = light.strip().split(', ')
        lights.append(
                f'{{\n'
                f'"lat": {lat},\n'
                f'"lon": {lon},\n'
                f'"state": true,\n'
                f'"active": true\n'
                f'}}'
                )

with open("lights.json", 'w') as json:
    json.writelines(['[\n', ','.join(lights), '\n]'])

