import bodyParser from 'body-parser';
import express from 'express';
import mqtt from 'mqtt';
import os from 'os';

// read the config
const config = require('./config.json') || process.env;

// connect to the MQTT queue
const options = {
    clientId: `mqtt-rest-${os.hostname}`
};
const client = mqtt.connect(config['MQTT_ADDRESS'], options);
client.on('connect', () => {
    console.info(`MQTT client ${options.clientId} connected.`);
});
client.on('error', () => {
    console.error(`MQTT client error: ${error}`);
    process.exit(1);
});

// initialise Express
let app = express();
app.use(bodyParser.json())

// define the POST end point that will publish the messages to the topic
app.post('/topic/:topicName', (req, res) => {
    console.log(`Sending to topic ${req.params.topicName} ${JSON.stringify(req.body)}`);
    client.publish(req.params.topicName, JSON.stringify(req.body));
    res.sendStatus(200);
});

// start the application running
const port = 3000;
app.listen(port, () => {
    console.info(`Server running at http://localhost:${port}`);
});

// add exit hook
process.on('exit', () => {
    console.info('Disconnecting from MQTT');
    client.end();
});
