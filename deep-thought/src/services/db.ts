import { $log, Service } from "@tsed/common";
import { Pool, PoolClient } from "pg";
import Config from "./config";

interface DatabaseQueryParam {
    name: string;
    value?: string;
}

@Service()
export default class DatabaseService {
    private pool: Pool | undefined;

    constructor(private readonly config: Config) {
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

        return this.query(
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

        return this.query(
            this.generateQuery("SELECT COUNT(*) FROM mqtt", "", dbQueryParams),
            params
        );
    }

    public getHistoryTypes = () => this.query("SELECT DISTINCT type FROM mqtt ORDER BY type ASC");

    public getHistoryEntities = () =>
        this.query("SELECT DISTINCT entity FROM mqtt ORDER BY entity ASC");

    public getHistoryActions = () =>
        this.query("SELECT DISTINCT action FROM mqtt ORDER BY action ASC");

    private async query(sql: string, params?: any[]) {
        let client: PoolClient | undefined;

        try {
            await this.connect();

            client = await this.pool?.connect();

            return await client?.query(sql, params);
        } catch (error) {
            $log.error("Error accessing database.", error);
        } finally {
            client?.release();
        }
    }

    private generateQuery(
        start: string,
        end: string = "",
        params: DatabaseQueryParam[],
        limit?: number,
        skip?: number
    ) {
        const generator = optionalArgumentGenerator(params);

        let sql = "";
        while (true) {
            const result = generator.next();

            if (result.done) {
                break;
            }

            sql += result.value;
        }

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

function optionalParameterList(...params: any[]) {
    const list: any[] = [];

    params.forEach((param) => {
        if (param) {
            list.push(param);
        }
    });

    return list;
}
