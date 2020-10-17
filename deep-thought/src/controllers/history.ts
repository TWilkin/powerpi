import HttpStatus from "http-status-codes";
import { QueryResult } from "pg";
import { $log, Controller, Get, QueryParams, Res, Response } from "@tsed/common";

import DatabaseService from "../services/db";
import RequiresRole from "../middleware/auth";
import Role from "../roles";

type QueryFunction = () => Promise<QueryResult<any> | undefined>;

@Controller("/history")
export default class HistoryController {

    constructor(private readonly databaseService: DatabaseService) { }

    @Get("/")
    @RequiresRole([Role.USER])
    async getHistory(
        @Res() response: Response,
        @QueryParams('type') type?: string,
        @QueryParams('entity') entity?: string,
        @QueryParams('action') action?: string
    ) {
        return this.query(
            response, 
            async () => this.databaseService.getHistory(type, entity, action)
        );
    }

    private async query(response: Response, func: QueryFunction) {
        try {
            const result = await func();

            response.send(result?.rows);
        } catch(error) {
            $log.error("Failed to query database.", error);

            response.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
