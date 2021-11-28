import { $log, Controller, Get, QueryParams, Res, Response } from "@tsed/common";
import HttpStatus from "http-status-codes";
import Authorize from "../middleware/auth";
import DatabaseService from "../services/db";

type QueryFunction = () => Promise<any | undefined>;

@Controller("/history")
export default class HistoryController {
    constructor(private readonly databaseService: DatabaseService) {}

    @Get("/types")
    @Authorize()
    getTypes(@Res() response: Response) {
        return this.query(
            response,
            async () => (await this.databaseService.getHistoryTypes())?.rows
        );
    }

    @Get("/entities")
    @Authorize()
    getEntities(@Res() response: Response) {
        return this.query(
            response,
            async () => (await this.databaseService.getHistoryEntities())?.rows
        );
    }

    @Get("/actions")
    @Authorize()
    getActions(@Res() response: Response) {
        return this.query(
            response,
            async () => (await this.databaseService.getHistoryActions())?.rows
        );
    }

    @Get("/")
    @Authorize()
    async getHistory(
        @Res() response: Response,
        @QueryParams("page") page: number = 0,
        @QueryParams("records") records: number = 30,
        @QueryParams("type") type?: string,
        @QueryParams("entity") entity?: string,
        @QueryParams("action") action?: string
    ) {
        return this.query(response, async () => {
            const data = await this.databaseService.getHistory(page, records, type, entity, action);
            data?.rows.forEach((row) => {
                if (typeof row.message === "string") {
                    row.message = JSON.parse(row.message);
                }
            });

            const count = await this.databaseService.getHistoryCount(type, entity, action);

            return {
                page,
                records: count?.rows[0]?.count,
                data: data?.rows,
            };
        });
    }

    private async query(response: Response, func: QueryFunction) {
        try {
            const result = await func();

            response.send(result);
        } catch (error) {
            $log.error("Failed to query database.", error);

            response.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
