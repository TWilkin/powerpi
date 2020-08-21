import bodyParser from 'body-parser';
import express from 'express';
import HttpStatus from 'http-status-codes';
import loggy from 'loggy';
import mqtt from 'mqtt';
import os from 'os';

import Config from './config';
import { BodyParserIncomingMessage, BodyParserRequest, TopicMessage } from './message';

// read the config
const config = new Config();

// connect to the MQTT queue
const options = {
    clientId: `mqtt-rest-${os.hostname}`
};
const client = mqtt.connect(config.mqttAddress, options);
client.on('connect', () => {
    loggy.info(`MQTT client ${options.clientId} connected.`);
});
client.on('error', (error) => {
    loggy.error(`MQTT client error: ${error}`);
    process.exit(1);
});

// initialise Express
let app = express();
app.use((req, res, next) => {
    bodyParser.json({
        verify: (req: BodyParserIncomingMessage, _, buf) => {
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
app.post('/topic/:type/:entity/:action', (req, res) => {
    // check we actually have a message
    const body = (req as BodyParserRequest).rawBody;
    if(!body) {
        res.sendStatus(HttpStatus.BAD_REQUEST);
    }

    // generate the topic name
    const message = new TopicMessage(req.params);
    const topicName = `${config.topicNameBase}/${message.topicName}`;

    // log that we're doing something with the request
    loggy.info(`Publishing to topic ${topicName}`);
    if(config.isDebug) {
        loggy.info(body);
    }

    // publish to MQTT
    client.publish(topicName, body);

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
