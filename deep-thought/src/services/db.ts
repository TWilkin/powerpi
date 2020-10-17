import { Client } from "pg";
import { $log, OnServerReady, Service } from "@tsed/common";

import Config from "./config";

@Service()
export default class DatabaseService implements OnServerReady {

    private client: Client | undefined;
    
    constructor(private readonly config: Config) {
        this.client = undefined;
    }

    $onServerReady() {
        this.connect();
    }

    public query(sql: string, values?: Array<any>) {
        return this.client?.query(sql, values);
    }

    private async connect() {
        if(!this.client) {
            this.client = new Client({
                connectionString: await this.config.getDatabaseURI()
            });

            await this.client.connect();
            $log.info("Database connected.");
        }
    }
}
