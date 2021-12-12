import { $log, Service } from "@tsed/common";
import { Pool, PoolClient } from "pg";
import Message from "../models/message";
import ConfigService from "./config";

interface DatabaseQueryParam {
    name: string;
    value?: string;
}

@Service()
export default class DatabaseService {
    private pool: Pool | undefined;

    constructor(private readonly config: ConfigService) {
        this.pool = undefined;
    }

    public getHistory(
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

        return this.query<Message>(
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

    public getHistoryCount(type?: string, entity?: string, action?: string) {
        const params = optionalParameterList(type, entity, action);

        const dbQueryParams = [
            { name: "type", value: type },
            { name: "entity", value: entity },
            { name: "action", value: action },
        ];

        return this.query<{ count: number }>(
            this.generateQuery("SELECT COUNT(*) FROM mqtt", "", dbQueryParams),
            params
        );
    }

    public getHistoryTypes = () =>
        this.query<string>("SELECT DISTINCT type FROM mqtt ORDER BY type ASC");

    public getHistoryEntities = () =>
        this.query<string>("SELECT DISTINCT entity FROM mqtt ORDER BY entity ASC");

    public getHistoryActions = () =>
        this.query<string>("SELECT DISTINCT action FROM mqtt ORDER BY action ASC");

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

        let sql = "";
        let result: IteratorResult<string, void> | undefined;
        do {
            result = generator.next();

            sql += result.value;
        } while (!result.done);

        const middle = sql.length > 0 ? `WHERE ${sql}` : "";
        sql = `${start} ${middle} ${end}`;

        if (limit !== undefined && skip !== undefined) {
            sql = `${sql} LIMIT ${limit} OFFSET ${skip}`;
        }

        return sql;
    }

    private async connect() {
        if (!this.pool) {
            this.pool = new Pool({
                connectionString: await this.config.getDatabaseURI(),
                max: 2,
                idleTimeoutMillis: 30 * 1000,
                connectionTimeoutMillis: 10 * 1000,
            });
        }
    }
}

function* optionalArgumentGenerator(params: DatabaseQueryParam[]) {
    let index = 1;
    for (const current of params) {
        if (current.value) {
            yield `${index > 1 ? " AND " : ""}${current.name} = $${index}::text`;
            index++;
        }
    }
}

function optionalParameterList(...params: (string | undefined)[]) {
    const list: string[] = [];

    params.forEach((param) => {
        if (param) {
            list.push(param);
        }
    });

    return list;
}
