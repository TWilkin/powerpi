import { $log, Service } from "@tsed/common";
import { Pool, PoolClient, QueryResultRow } from "pg";
import Message from "../models/message";
import ConfigService from "./config";

enum DatabaseOperator {
    Equal = "=",
    GreaterThan = ">",
    GreaterThanEqual = ">=",
    LessThanEqual = "<=",
    LessThan = "<",
}

interface DatabaseQueryValueParam {
    name: string;
    value?: string;
    operator?: DatabaseOperator;
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
        limit: number,
        start?: Date,
        end?: Date,
        type?: string,
        entity?: string,
        action?: string
    ) {
        const params = optionalParameterList(start, end, type, entity, action);

        const dbQueryParams = [
            { name: "timestamp", start, end },
            { name: "type", value: type },
            { name: "entity", value: entity },
            { name: "action", value: action },
        ];

        return await this.query<Message>(
            this.generateQuery(
                "SELECT * FROM mqtt",
                "ORDER BY timestamp DESC, type, entity, action",
                dbQueryParams,
                limit
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
            { name: "timestamp", start, end },
            { name: "type", value: type },
            { name: "entity", value: entity },
            { name: "action", value: action },
        ];

        return await this.query<Message>(
            this.generateQuery("SELECT * FROM mqtt", "ORDER BY timestamp ASC", dbQueryParams),
            params
        );
    }

    public async getHistoryCount(
        start?: Date,
        end?: Date,
        type?: string,
        entity?: string,
        action?: string
    ) {
        const params = optionalParameterList(start, end, type, entity, action);

        const dbQueryParams = [
            { name: "timestamp", start, end },
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
        await this.query<{ type: string }>("SELECT DISTINCT type FROM mqtt ORDER BY type ASC");

    public async getHistoryEntities(type: string | undefined) {
        const params = optionalParameterList(type);
        const dbQueryParams = [{ name: "type", value: type }];

        return await this.query<{ entity: string }>(
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

        return await this.query<{ action: string }>(
            this.generateQuery(
                "SELECT DISTINCT action FROM mqtt",
                "ORDER BY action ASC",
                dbQueryParams
            ),
            params
        );
    }

    public async isAlive() {
        return await this.query<{ value: number }>("SELECT 1 AS value");
    }

    private async query<TResult extends QueryResultRow>(sql: string, params?: (string | Date)[]) {
        let client: PoolClient | undefined;

        try {
            await this.connect();

            client = await this.pool?.connect();

            $log.debug("params: ", JSON.stringify(params));

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
            limit !== undefined && skip !== undefined
                ? `LIMIT ${limit} OFFSET ${skip}`
                : limit !== undefined
                ? `LIMIT ${limit}`
                : "";

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

        const normal = (value: Date | string | undefined, operator = DatabaseOperator.Equal) => {
            if (value) {
                const valueType = getParameterType(value);

                return `${current.name} ${operator} $${index++}::${valueType}`;
            }

            return undefined;
        };

        if ("value" in current) {
            // DatabaseQueryValueParam
            paramSql = normal(current.value);
        } else if ("start" in current) {
            // DatabaseQueryBetweenParam
            if (current.start) {
                const startType = getParameterType(current.start);

                if (current.end) {
                    const endType = getParameterType(current.end);

                    paramSql = `${
                        current.name
                    } BETWEEN $${index++}::${startType} AND $${index++}::${endType}`;
                } else {
                    // we only have start
                    paramSql = normal(current.start, DatabaseOperator.GreaterThanEqual);
                }
            }

            // we only have end
            if (!paramSql) {
                paramSql = normal(current.end, DatabaseOperator.LessThanEqual);
            }
        }

        if (paramSql) {
            yield `${!isFirst ? " AND " : ""}${paramSql}`;
        }
    }
}

function optionalParameterList(...params: (string | Date | undefined)[]) {
    return params.filter((param) => param) as (string | Date)[];
}

function getParameterType(param: string | Date) {
    if (param instanceof Date) {
        return "timestamptz";
    }

    return "text";
}
