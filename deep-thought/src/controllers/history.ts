import { $log, Controller, Get, QueryParams, Res, Response } from "@tsed/common";
import HttpStatus from "http-status-codes";
import Authorize from "../middleware/auth";
import DatabaseService from "../services/db";

type QueryFunction<TResult> = () => Promise<TResult | undefined>;

@Controller("/history")
export default class HistoryController {
    constructor(private readonly databaseService: DatabaseService) {}

    @Get("/types")
    @Authorize()
    async getTypes(@Res() response: Response) {
        return await this.query(
            response,
            async () => (await this.databaseService.getHistoryTypes())?.rows
        );
    }

    @Get("/entities")
    @Authorize()
    async getEntities(@Res() response: Response, @QueryParams("type") type?: string) {
        return await this.query(
            response,
            async () => (await this.databaseService.getHistoryEntities(type))?.rows
        );
    }

    @Get("/actions")
    @Authorize()
    async getActions(@Res() response: Response, @QueryParams("type") type?: string) {
        return await this.query(
            response,
            async () => (await this.databaseService.getHistoryActions(type))?.rows
        );
    }

    @Get("/")
    @Authorize()
    async getHistory(
        @Res() response: Response,
        @QueryParams("page") page = 0,
        @QueryParams("records") records = 30,
        @QueryParams("type") type?: string,
        @QueryParams("entity") entity?: string,
        @QueryParams("action") action?: string
    ) {
        return await this.query(response, async () => {
            const data = await this.databaseService.getHistory(page, records, type, entity, action);

            const count = await this.databaseService.getHistoryCount(type, entity, action);

            return {
                page,
                records: count?.rows[0]?.count,
                data: data?.rows.map((row) => {
                    if (typeof row.message === "string") {
                        row.message = JSON.parse(row.message);
                    }
                    return row;
                }),
            };
        });
    }

    private async query<TResult>(response: Response, func: QueryFunction<TResult>) {
        try {
            const result = await func();

            response.send(result);
        } catch (error) {
            $log.error("Failed to query database.", error);

            response.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
