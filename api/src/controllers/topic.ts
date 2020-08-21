import { Response } from 'express';
import HttpStatus from 'http-status-codes';
import { connect, MqttClient } from 'mqtt';
import os from 'os';
import { BodyParams, Controller, PathParams, Post, Required, Res, $log } from '@tsed/common';

import Config from '../config';

@Controller("/topic")
export default class TopicController {

    private config: Config = new Config();
    private client: MqttClient = connectMQTT(this.config);

    @Post("/:type/:entity/:action")
    writeMessage(
        @PathParams('type') type: string,
        @PathParams('entity') entity: string,
        @PathParams('action') action: string,
        @Required() @BodyParams('status') status: string,
        @Res() response: Response
    ) {
        if(!status || status === '') {
            response.sendStatus(HttpStatus.BAD_REQUEST);
            return;
        }
        
        // generate the topic name
        const topicName = `${this.config.topicNameBase}/${type}/${entity}/${action}`;

        // log that we're doing something with the request
        $log.info(`Publishing to topic ${topicName}`);

        // publish to MQTT
        this.client.publish(topicName, JSON.stringify({ status: status }));

        response.sendStatus(HttpStatus.CREATED);
    }
};

function connectMQTT(config: Config): MqttClient {
    const options = {
        clientId: `api-${os.hostname}`
    };

    let client = connect(config.mqttAddress, options);
    
    client.on('connect', () => {
        $log.info(`MQTT client ${options.clientId} connected.`);
    });

    client.on('error', (error) => {
        $log.error(`MQTT client error: ${error}`);
        process.exit(1);
    });

    return client;
}
