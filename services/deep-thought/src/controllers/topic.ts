import { AdditionalState, DeviceState } from "@powerpi/api";
import { OutgoingMessage } from "@powerpi/common";
import { BodyParams, Controller, PathParams, Post, Res } from "@tsed/common";
import { Required } from "@tsed/schema";
import { Response } from "express";
import HttpStatus from "http-status-codes";
import _ from "underscore";
import Authorize from "../middleware/auth";
import MqttService from "../services/mqtt";

type ChangeMessage = AdditionalState & { state?: DeviceState };

@Controller("/topic")
export default class TopicController {
    private static readonly allowedKeys = [
        "state",
        "brightness",
        "temperature",
        "hue",
        "saturation",
    ];

    constructor(private readonly mqttService: MqttService) {}

    @Post("/:type/:entity/:action")
    @Authorize()
    writeMessage(
        @PathParams("type") type: string,
        @PathParams("entity") entity: string,
        @PathParams("action") action: string,
        @Required() @BodyParams() body: ChangeMessage,
        @Res() response: Response
    ) {
        // fail if there is no message or it contains disallowed keys
        if (!body || _(Object.keys(body)).difference(TopicController.allowedKeys).length > 0) {
            response.sendStatus(HttpStatus.BAD_REQUEST);
            return;
        }
        // generate the message
        const message: OutgoingMessage = {
            ...body,
        };

        // publish to MQTT
        this.mqttService.publish(type, entity, action, message);

        response.sendStatus(HttpStatus.CREATED);
    }
}
