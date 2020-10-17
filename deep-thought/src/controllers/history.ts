import HttpStatus from "http-status-codes";
import { $log, Controller, Get, Res, Response } from "@tsed/common";

import DatabaseService from "../services/db";
import RequiresRole from "../middleware/auth";
import Role from "../roles";

@Controller("/history")
export default class HistoryController {

    constructor(private readonly databaseService: DatabaseService) { }

    @Get("/")
    @RequiresRole([Role.USER])
    async getAllHistory(
        @Res() response: Response
    ) {
        await this.query(
            response,
            `SELECT * FROM mqtt
            ORDER BY timestamp DESC;`
        );
    }

    private async query(response: Response, sql: string, values?: Array<any>) {
        try {
            const result = await this.databaseService.query(sql, values);

            response.send(result?.rows);
        } catch(error) {
            $log.error("Failed to query database.", error);

            response.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
