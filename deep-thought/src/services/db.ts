import { $log, Service } from "@tsed/common";
import { Pool, PoolClient } from "pg";
import Message from "../models/message";
import ConfigService from "./config";

interface DatabaseQueryValueParam {
    name: string;
    value?: string;
}

interface DatabaseQueryBetweenParam {
    name: string;
    start?: Date;
    end?: Date;
}

type DatabaseQueryParam = DatabaseQueryValueParam | DatabaseQueryBetweenParam;

@Service()
export default class DatabaseService {
    private pool: Pool | undefined;

    constructor(private readonly config: ConfigService) {
        this.pool = undefined;
    }

    public async getHistory(
        page: number,
        limit: number,
        type?: string,
        entity?: string,
        action?: string
    ) {
        const params = optionalParameterList(type, entity, action);

        const dbQueryParams = [
            { name: "type", value: type },
            { name: "entity", value: entity },
            { name: "action", value: action },
        ];

        const skip = limit * page;

        return await this.query<Message>(
            this.generateQuery(
                "SELECT * FROM mqtt",
                "ORDER BY timestamp DESC",
                dbQueryParams,
                limit,
                skip
            ),
            params
        );
    }

    public async getHistoryRange(
        start?: Date,
        end?: Date,
        type?: string,
        entity?: string,
        action?: string
    ) {
        const params = optionalParameterList(start, end, type, entity, action);

        const dbQueryParams = [
            { name: "range", start, end },
            { name: "type", value: type },
            { name: "entity", value: entity },
            { name: "action", value: action },
        ];

        return await this.query<Message>(
            this.generateQuery("SELECT * FROM mqtt", "ORDER BY timestamp ASC", dbQueryParams),
            params
        );
    }

    public async getHistoryCount(type?: string, entity?: string, action?: string) {
        const params = optionalParameterList(type, entity, action);

        const dbQueryParams = [
            { name: "type", value: type },
            { name: "entity", value: entity },
            { name: "action", value: action },
        ];

        return await this.query<{ count: number }>(
            this.generateQuery("SELECT COUNT(*) FROM mqtt", "", dbQueryParams),
            params
        );
    }

    public getHistoryTypes = async () =>
        await this.query<string>("SELECT DISTINCT type FROM mqtt ORDER BY type ASC");

    public async getHistoryEntities(type: string | undefined) {
        const params = optionalParameterList(type);
        const dbQueryParams = [{ name: "type", value: type }];

        return await this.query<string>(
            this.generateQuery(
                "SELECT DISTINCT entity FROM mqtt",
                "ORDER BY entity ASC",
                dbQueryParams
            ),
            params
        );
    }

    public async getHistoryActions(type: string | undefined) {
        const params = optionalParameterList(type);
        const dbQueryParams = [{ name: "type", value: type }];

        return await this.query<string>(
            this.generateQuery(
                "SELECT DISTINCT action FROM mqtt",
                "ORDER BY entity ASC",
                dbQueryParams
            ),
            params
        );
    }

    private async query<TResult>(sql: string, params?: string[]) {
        let client: PoolClient | undefined;

        try {
            await this.connect();

            client = await this.pool?.connect();

            return await client?.query<TResult>(sql, params);
        } catch (error) {
            $log.error("Error accessing database.", error);
        } finally {
            client?.release();
        }
    }

    private generateQuery(
        start: string,
        end = "",
        params: DatabaseQueryParam[],
        limit?: number,
        skip?: number
    ) {
        const generator = optionalArgumentGenerator(params);

        let whereClause = "";
        let result: IteratorResult<string, void> | undefined;
        do {
            result = generator.next();

            if (result.value) {
                whereClause += result.value;
            }
        } while (!result.done);

        whereClause = whereClause.length > 0 ? `WHERE ${whereClause}` : "";

        const limitClause =
            limit !== undefined && skip !== undefined ? `LIMIT ${limit} OFFSET ${skip}` : "";

        const sql = `${start} ${whereClause} ${end} ${limitClause}`.trim();

        $log.debug(sql);

        return sql;
    }

    private async connect() {
        if (!this.pool) {
            try {
                this.pool = new Pool({
                    connectionString: await this.config.databaseURI,
                    max: 2,
                    idleTimeoutMillis: 30 * 1000,
                    connectionTimeoutMillis: 10 * 1000,
                });
            } catch (error) {
                $log.error("Error connecting to database", error);
                process.exit(-1);
            }
        }
    }
}

function* optionalArgumentGenerator(params: DatabaseQueryParam[]) {
    let index = 1;
    for (const current of params) {
        const isFirst = index === 1;

        let paramSql: string | undefined;

        if ("value" in current) {
            // DatabaseQueryValueParam
            if (current.value) {
                paramSql = `${current.name} = $${index}::text`;
                index++;
            }
        } else if ("start" in current) {
            // DatabaseQueryBetweenParam
            if (current.start && current.end) {
                paramSql = `${current.name} BETWEEN ${index++}::text AND ${index++}::text`;
            }
        }

        if (paramSql) {
            yield `${!isFirst ? " AND " : ""}${paramSql}`;
        }
    }
}

function optionalParameterList(...params: (string | Date | undefined)[]) {
    const list: string[] = [];

    params.forEach((param) => {
        if (param) {
            list.push(param.toLocaleString());
        }
    });

    return list;
}
