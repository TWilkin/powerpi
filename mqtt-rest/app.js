import bodyParser from 'body-parser';
import express from 'express';
const HttpStatus = require('http-status-codes');
import loggy from 'loggy';
import mqtt from 'mqtt';
import os from 'os';

// read the config
const config = process.env;

// connect to the MQTT queue
const options = {
    clientId: `mqtt-rest-${os.hostname}`
};
const client = mqtt.connect(config['MQTT_ADDRESS'], options);
client.on('connect', () => {
    loggy.info(`MQTT client ${options.clientId} connected.`);
});
client.on('error', () => {
    loggy.error(`MQTT client error: ${error}`);
    process.exit(1);
});

// initialise Express
let app = express();
app.use((req, res, next) => {
    bodyParser.json({
        verify: (req, res, buf, encoding) => {
            req.rawBody = buf.toString();
        }
    })(req, res, (err) => {
        if(err) {
            loggy.error(err);
            res.sendStatus(HttpStatus.BAD_REQUEST);
            return;
        }
        next();
    });
});

// define the POST end point that will publish the messages to the topic
app.post('/topic/:topicName', (req, res) => {
    // check we actually have a message
    if(!req.rawBody) {
        res.sendStatus(HttpStatus.BAD_REQUEST);
    }

    // log that we're doing something with the request
    loggy.info(`Publishing to topic ${req.params.topicName}`);
    if(config['DEBUG']) {
        loggy.info(req.rawBody);
    }

    // publish to MQTT
    client.publish(req.params.topicName, req.rawBody);

    // tell the requestor we're done
    res.sendStatus(HttpStatus.OK);
});

// start the application running
const port = 3000;
app.listen(port, () => {
    loggy.info(`Server running at http://localhost:${port}`);
});

// add exit hook
process.on('exit', () => {
    loggy.info('Disconnecting from MQTT');
    client.end();
});
