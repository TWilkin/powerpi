import { Pool, PoolClient } from "pg";
import { $log, OnServerReady, Service } from "@tsed/common";

import Config from "./config";

interface DatabaseQueryParam {
    name: string;
    value?: string;
}

@Service()
export default class DatabaseService implements OnServerReady {

    private pool: Pool | undefined;
    
    constructor(private readonly config: Config) {
        this.pool = undefined;
    }

    $onServerReady() {
        this.connect();
    }

    public getHistory(type?: string, entity?: string, action?: string) {
        let params = [];
        if(type) { params.push(type); }
        if(entity) { params.push(entity); }
        if(action) { params.push(action); }

        return this.query(
            this.generateQuery(
                "SELECT * FROM mqtt",
                "ORDER BY timestamp DESC",
                { name: "type", value: type },
                { name: "entity", value: entity },
                { name: "action", value: action }
            ),
            params
        );
    }

    public getHistoryTypes = () => this.query("SELECT DISTINCT type FROM mqtt ORDER BY type ASC;");
    public getHistoryEntities = () => this.query("SELECT DISTINCT entity FROM mqtt ORDER BY entity ASC;");
    public getHistoryActions = () => this.query("SELECT DISTINCT action FROM mqtt ORDER BY action ASC;");

    private async query(sql: string, params?: any[]) {
        let client: PoolClient | undefined = undefined;

        try {
            client = await this.pool?.connect();

            return await client?.query(sql, params);
        } catch(error) {
            $log.error("Error accessing database.", error);
        } finally {
            client?.release();
        }
    }

    private generateQuery(start: string, end: string, ...params: DatabaseQueryParam[]) {
        const generator = optionalArgumentGenerator(params);

        let sql = "";
        while(true) {
            const result = generator.next();

            if(result.done) {
                break;
            }

            sql += result.value;
        }

        if(sql.length > 0) {
            return `${start} WHERE ${sql} ${end}`
        }
        
        return `${start} ${end}`;
    }

    private async connect() {
        if(!this.pool) {
            this.pool = new Pool({
                connectionString: await this.config.getDatabaseURI(),
                max: 2,
                idleTimeoutMillis: 30 * 1000,
                connectionTimeoutMillis: 10 * 1000
            });
        }
    }
}

function* optionalArgumentGenerator(params: DatabaseQueryParam[]) {
    let index = 1;
    for(let i = 0; i < params.length; i++) {
        const current = params[i];

        if(current.value) {
            yield `${index > 1 ? " AND " : ""}${current.name} = $${index}::text`;
            index++;
        }
    }
}
