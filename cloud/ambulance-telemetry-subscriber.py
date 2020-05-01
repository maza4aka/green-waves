from firebase_admin import initialize_app

from firebase_admin import credentials
from firebase_admin import db

from json import loads
from os import getenv

from base64 import b64decode


initialize_app(
        credential=credentials.Certificate(
            loads(getenv("FIREBASE_CONFIG"))
        ), options={
            'databaseURL': 'https://green-wave-dummy.firebaseio.com/'
            }
)

def ambulance_telemetry_writer(event, context):

    print('waking up...')

    payload = loads(
        b64decode(
            event['data']
        ).decode('utf-8')
    )

    print(f'recieved payload: {payload}')

    vehicle_id = payload.pop('id', 'unknown?')

    base = db.reference(f'devices/vehicles').child(vehicle_id)

    print(f'writing data for {vehicle_id} vehicle: {payload}')

    base.push(payload)
