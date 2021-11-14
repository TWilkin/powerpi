import path from "path";
import { LoggerService } from "powerpi-common";
import { Sequelize } from "sequelize-typescript";
import { Service } from "typedi";
import Container from "../container";
import ConfigService from "./config";

@Service()
export default class DbService {
    private readonly logger: LoggerService;

    private sequelize: Sequelize | undefined;

    constructor(private config: ConfigService) {
        this.logger = Container.get(LoggerService);
    }

    public async connect() {
        const databaseUri = await this.config.databaseURI;

        this.logger.info(`Connecting to database ${this.config.databaseSchema}`);

        this.sequelize = new Sequelize(databaseUri, {
            modelPaths: [path.join(__dirname, "models", "*.model.ts")],
            logging: (sql) => console.info(`SQL: ${sql}`),
        });

        await this.sequelize.sync();
    }
}
