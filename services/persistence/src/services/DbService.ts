import { LoggerService } from "@powerpi/common";
import { Sequelize } from "sequelize-typescript";
import { Service } from "typedi";
import _ from "underscore";
import Container from "../Container.js";
import MqttModel from "../models/mqtt.model.js";
import ConfigService from "./ConfigService.js";

@Service()
export default class DbService {
    private readonly logger: LoggerService;

    private sequelize: Sequelize | undefined;

    constructor(private readonly config: ConfigService) {
        this.logger = Container.get(LoggerService);
    }

    public async connect() {
        const databaseUri = await this.config.databaseURI;

        this.logger.info("Connecting to database", this.config.databaseSchema);

        this.sequelize = new Sequelize(databaseUri, {
            logging: (sql) => this.logger.debug("SQL:", sql),
        });

        this.sequelize.addModels([MqttModel]);

        await this.sequelize.sync();
    }

    public async isAlive() {
        if (this.sequelize) {
            const [results, __] = await this.sequelize.query("SELECT 1 AS value");

            return (_(results as { value: number }[]).first()?.value ?? 0) === 1;
        }

        return false;
    }
}
