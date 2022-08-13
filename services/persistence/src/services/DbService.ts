import { LoggerService } from "@powerpi/common";
import { Sequelize } from "sequelize-typescript";
import { Service } from "typedi";
import Container from "../Container";
import MqttModel from "../models/mqtt.model";
import ConfigService from "./ConfigService";

@Service()
export default class DbService {
    private readonly logger: LoggerService;

    private sequelize: Sequelize | undefined;

    constructor(private config: ConfigService) {
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
}
