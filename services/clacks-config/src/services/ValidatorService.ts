import { ConfigFileType, LoggerService } from "@powerpi/common";
import Ajv from "ajv";
import { promises as fs } from "fs";
import path from "path";
import { Service } from "typedi";
import Container from "../container";

@Service()
export default class ValidatorService {
    private logger: LoggerService;
    private validator: Ajv;

    constructor() {
        this.logger = Container.get(LoggerService);

        this.validator = new Ajv();
    }

    public async validate(fileType: ConfigFileType, file: object) {
        // get the schema if it exists
        const validator = await this.loadSchema(fileType);

        // if it does, validate the file
        if (validator) {
            return validator(file);
        }

        return false;
    }

    private async loadSchema(fileType: ConfigFileType) {
        // generate the file name
        const fileName = path.join("schema", `${fileType}.schema.json`);

        // get the file
        try {
            const content = await fs.readFile(fileName);
            const schema = JSON.parse(content.toString());

            return await this.validator.compileAsync(schema);
        } catch {
            this.logger.error("Could not load schema for", fileType);
        }

        return undefined;
    }
}
