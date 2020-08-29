import { Response } from 'express';
import HttpStatus from 'http-status-codes';
import { BodyParams, Controller, PathParams, Post, Required, Res, $log } from '@tsed/common';

import Config from '../services/config';
import RequiresRole from '../middleware/auth';
import Role from '../roles';
import MqttService from '../services/mqtt';

@Controller('/topic')
export default class TopicController {

    constructor(private readonly config: Config, private readonly mqttService: MqttService) { }

    @Post('/:type/:entity/:action')
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
            state: state
        };

        // publish to MQTT
        this.mqttService.publish(topicName, message);

        response.sendStatus(HttpStatus.CREATED);
    }
};
