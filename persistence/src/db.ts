import path from "path";
import { Sequelize } from "sequelize-typescript";

import Config from "./config";

const sequelize = new Sequelize(Config.databaseURI, {
    modelPaths: [path.join(__dirname, "models", "*.model.ts")],
    logging: (sql) => console.info(`SQL: ${sql}`),
});
export default sequelize;
