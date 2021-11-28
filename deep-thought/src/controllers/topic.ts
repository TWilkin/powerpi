import { $log, BodyParams, Controller, PathParams, Post, Required, Res } from "@tsed/common";
import { Response } from "express";
import Authorize from "../middleware/auth";
import Config from "../services/config";
import MqttService from "../services/mqtt";
import HttpStatus = require("http-status-codes");

@Controller("/topic")
export default class TopicController {
    constructor(private readonly config: Config, private readonly mqttService: MqttService) {}

    @Post("/:type/:entity/:action")
    @Authorize()
    writeMessage(
        @PathParams("type") type: string,
        @PathParams("entity") entity: string,
        @PathParams("action") action: string,
        @Required() @BodyParams("state") state: string,
        @Res() response: Response
    ) {
        if (!state || state === "") {
            response.sendStatus(HttpStatus.BAD_REQUEST);
            return;
        }

        // generate the topic name
        const topicName = `${this.config.topicNameBase}/${type}/${entity}/${action}`;

        // log that we're doing something with the request
        $log.info(`Publishing to topic ${topicName}`);

        // generate the message
        const message = {
            state,
        };

        // publish to MQTT
        this.mqttService.publish(topicName, message);

        response.sendStatus(HttpStatus.CREATED);
    }
}
