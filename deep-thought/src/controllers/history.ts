import {
  $log,
  Controller,
  Get,
  QueryParams,
  Res,
  Response
} from "@tsed/common";
import { QueryResult } from "pg";
import Authorize from "../middleware/auth";
import DatabaseService from "../services/db";
import HttpStatus = require("http-status-codes");

type QueryFunction = () => Promise<QueryResult<any> | undefined>;

@Controller("/history")
export default class HistoryController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get("/types")
  @Authorize()
  getTypes(@Res() response: Response) {
    return this.query(
      response,
      async () => await this.databaseService.getHistoryTypes()
    );
  }

  @Get("/entities")
  @Authorize()
  getEntities(@Res() response: Response) {
    return this.query(
      response,
      async () => await this.databaseService.getHistoryEntities()
    );
  }

  @Get("/actions")
  @Authorize()
  getActions(@Res() response: Response) {
    return this.query(
      response,
      async () => await this.databaseService.getHistoryActions()
    );
  }

  @Get("/")
  @Authorize()
  async getHistory(
    @Res() response: Response,
    @QueryParams("type") type?: string,
    @QueryParams("entity") entity?: string,
    @QueryParams("action") action?: string
  ) {
    return await this.query(response, async () => {
      const result = await this.databaseService.getHistory(
        type,
        entity,
        action
      );

      result?.rows.forEach((row) => (row.message = JSON.parse(row.message)));

      return result;
    });
  }

  private async query(response: Response, func: QueryFunction) {
    try {
      const result = await func();

      response.send(result?.rows);
    } catch (error) {
      $log.error("Failed to query database.", error);

      response.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
