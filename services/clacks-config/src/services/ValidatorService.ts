import { ConfigFileType, LoggerService } from "@powerpi/common";
import addFormats from "ajv-formats";
import Ajv from "ajv/dist/2020";
import { Service } from "typedi";
import Container from "../container";
import loadSchema from "../schema";

@Service()
export default class ValidatorService {
    private logger: LoggerService;
    private ajv: Ajv;

    constructor() {
        this.logger = Container.get(LoggerService);

        this.ajv = new Ajv();
        addFormats(this.ajv);
    }

    public async initialise() {
        const allSchema = loadSchema();

        for (const fileType in allSchema) {
            const key = fileType as keyof typeof allSchema;
            const schema = allSchema[key];

            this.ajv.addSchema(schema, key);
        }
    }

    public async validate(fileType: ConfigFileType, file: object) {
        const validator = this.ajv.getSchema(fileType);

        if (validator) {
            if (validator(file)) {
                return true;
            }

            // failed validation
            this.logger.error("File", fileType, "failed validation");
            this.logger.error(validator.errors);
        } else {
            this.logger.error("Could not find schema for", fileType);
        }

        return false;
    }
}
