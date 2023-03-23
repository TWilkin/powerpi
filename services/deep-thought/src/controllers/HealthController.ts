import { Controller, Get, Res } from "@tsed/common";
import { Response } from "express";
import HttpStatus from "http-status-codes";
import ConfigService from "../services/config";
import DatabaseService from "../services/db";
import MqttService from "../services/mqtt";

@Controller("/health")
export default class HealthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly dbService: DatabaseService,
        private readonly mqttService: MqttService
    ) {}

    @Get("/")
    async getHealth(@Res() response: Response) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

        const status: { database?: boolean; mqtt: boolean } = {
            database: undefined,
            mqtt: true,
        };

        // check we can access the message queue
        status.mqtt = this.mqttService.connected;

        // only check the db connection if we have persistence
        if (await this.configService.hasPersistence()) {
            const result = await this.dbService.isAlive();

            status.database = (result?.rowCount ?? 0) < 1;
        }

        response.send(status);

        if (status.database === false || !status.mqtt) {
            response.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            response.sendStatus(HttpStatus.OK);
        }
    }
}
