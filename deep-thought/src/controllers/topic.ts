import { Response } from 'express';
import HttpStatus from 'http-status-codes';
import { connect, IClientPublishOptions, MqttClient } from 'mqtt';
import os from 'os';
import { BodyParams, Controller, PathParams, Post, Required, Res, $log } from '@tsed/common';

import Config from '../config';
import { RequiresRole, Role } from '../middleware/auth';

@Controller("/topic")
export default class TopicController {

    private config: Config = new Config();
    private client: MqttClient = connectMQTT(this.config);

    @Post("/:type/:entity/:action")
    @RequiresRole([Role.WEB, Role.USER])
    writeMessage(
        @PathParams('type') type: string,
        @PathParams('entity') entity: string,
        @PathParams('action') action: string,
        @Required() @BodyParams('state') state: string,
        @Res() response: Response
    ) {
        if(!state || state === '') {
            response.sendStatus(HttpStatus.BAD_REQUEST);
            return;
        }
        
        // generate the topic name
        const topicName = `${this.config.topicNameBase}/${type}/${entity}/${action}`;

        // log that we're doing something with the request
        $log.info(`Publishing to topic ${topicName}`);

        // generate the message
        const message = {
            state: state,
            timestamp: new Date().getTime()
        };

        // publish to MQTT
        const options: IClientPublishOptions = {
            qos: 2,
            retain: true
        };
        this.client.publish(topicName, JSON.stringify(message), options);

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
