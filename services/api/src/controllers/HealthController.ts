import { MqttService } from "@powerpi/common";
import { Controller, Get, Res } from "@tsed/common";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import _ from "underscore";
import ConfigService from "../services/ConfigService.js";
import DatabaseService from "../services/DatabaseService.js";

@Controller("/health")
export default class HealthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly dbService: DatabaseService,
        private readonly mqttService: MqttService,
    ) {}

    @Get("/")
    async getHealth(@Res() response: Response) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

        const status: { database?: boolean; mqtt?: boolean } = {};

        // check we can access the message queue
        status.mqtt = this.mqttService.connected;

        // only check the db connection if we have persistence
        if (await this.configService.hasPersistence()) {
            const result = await this.dbService.isAlive();

            status.database = (_(result?.rows).first()?.value ?? 0) === 1;
        }

        response
            .status(
                status.database === false || !status.mqtt
                    ? StatusCodes.INTERNAL_SERVER_ERROR
                    : StatusCodes.OK,
            )
            .send(status);
    }
}
