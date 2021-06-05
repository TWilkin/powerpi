import {
  $log,
  Controller,
  Get,
  QueryParams,
  Res,
  Response
} from "@tsed/common";
import HttpStatus from "http-status-codes";
import { QueryResult } from "pg";
import RequiresRole from "../middleware/auth";
import Role from "../roles";
import DatabaseService from "../services/db";

type QueryFunction = () => Promise<QueryResult<any> | undefined>;

@Controller("/history")
export default class HistoryController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get("/types")
  @RequiresRole([Role.USER])
  getTypes(@Res() response: Response) {
    return this.query(
      response,
      async () => await this.databaseService.getHistoryTypes()
    );
  }

  @Get("/entities")
  @RequiresRole([Role.USER])
  getEntities(@Res() response: Response) {
    return this.query(
      response,
      async () => await this.databaseService.getHistoryEntities()
    );
  }

  @Get("/actions")
  @RequiresRole([Role.USER])
  getActions(@Res() response: Response) {
    return this.query(
      response,
      async () => await this.databaseService.getHistoryActions()
    );
  }

  @Get("/")
  @RequiresRole([Role.USER])
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
