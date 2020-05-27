const firebase = require('firebase-admin');

const config = {
  firebase: JSON.parse(process.env.FIREBASE_CONFIG)
};

firebase.initializeApp({
  credential: firebase.credential.cert(config.firebase),
  databaseURL: "https://green-wave-dummy.firebaseio.com"
});

exports.ambulance_telemetry_writer = async (event, context) => {
  console.log("waking up...");

  const pubsubMessage = event.data;
  const payloadString = Buffer.from(pubsubMessage, 'base64').toString();

  console.log(`recieved payload: ${payloadString}`);

  const payloadJSON = JSON.parse(payloadString);

  let vehicleID = payloadJSON.id
  if (!vehicleID) vehicleID = 'unknown?';
  delete payloadJSON.id;

  const base = firebase.database().ref('devices/vehicles').child(vehicleID);
  
  console.log(`writing data for ${vehicleID}: ${JSON.stringify(payloadJSON)}`);
  await base.push(payloadJSON);
};

