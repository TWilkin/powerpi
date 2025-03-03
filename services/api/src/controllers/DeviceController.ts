import { MqttService, OutgoingMessage } from "@powerpi/common";
import { ChangeMessage } from "@powerpi/common-api";
import { BodyParams, Controller, Get, PathParams, Post, Res } from "@tsed/common";
import { Required } from "@tsed/schema";
import { Response } from "express";
import HttpStatus from "http-status-codes";
import _ from "underscore";
import Authorize from "../middleware/AuthorizeMiddleware";
import DeviceStateService from "../services/DeviceStateService";

@Controller("/device")
export default class DeviceController {
    private static readonly allowedChangeMessageKeys = [
        "state",
        "brightness",
        "temperature",
        "hue",
        "saturation",
        "stream",
    ];

    constructor(
        private readonly deviceService: DeviceStateService,
        private readonly mqttService: MqttService,
    ) {}

    @Get("/")
    @Authorize()
    getAllDevices() {
        return _(this.deviceService.devices).sortBy((device) =>
            (device.display_name ?? device.name).toLocaleLowerCase(),
        );
    }

    @Post("/:device")
    @Authorize()
    async change(
        @PathParams("device") device: string,
        @Required() @BodyParams() body: ChangeMessage,
        @Res() response: Response,
    ) {
        // fail if there is no message or it contains disallowed keys
        if (
            !body ||
            _(Object.keys(body)).difference(DeviceController.allowedChangeMessageKeys).length > 0
        ) {
            response.sendStatus(HttpStatus.BAD_REQUEST);
            return;
        }

        // check if the device exists
        if (!this.deviceService.devices.find((d) => d.name === device)) {
            response.sendStatus(HttpStatus.NOT_FOUND);
            return;
        }

        // generate the message
        const message: OutgoingMessage = {
            ...body,
        };

        // publish to MQTT
        await this.mqttService.publish("device", device, "change", message);

        response.sendStatus(HttpStatus.CREATED);
    }
}
