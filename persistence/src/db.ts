import path from "path";
import { Sequelize } from "sequelize-typescript";

import Config from "./config";


export const sequelize = new Sequelize(
    Config.getDatabaseURI,
    {
        modelPaths: [path.join(__dirname, "models", "*.model.ts")],
        logging: true
    }
);
