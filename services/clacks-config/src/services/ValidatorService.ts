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
        const { common, devices, config } = loadSchema();

        this.addSchema(common);
        this.addSchema(devices);
        this.addSchema(config);
    }

    public async validate(fileType: ConfigFileType, file: object) {
        const validator = this.ajv.getSchema(fileType);

        if (validator) {
            if (validator(file)) {
                return true;
            }

            // failed validation
            throw new ValidationException(
                fileType,
                validator.errors ? JSON.stringify(validator.errors) : undefined
            );
        } else {
            this.logger.error("Could not find schema for", fileType);
        }

        return false;
    }

    private addSchema<TSchema>(schema: TSchema) {
        for (const type in schema) {
            const key = type as keyof typeof schema;

            const currentSchema = schema[key];

            this.ajv.addSchema(currentSchema, type);
        }
    }
}

export class ValidationException extends Error {
    constructor(private fileType: ConfigFileType, public errors: string | undefined) {
        super();
    }

    get message() {
        return `File ${this.fileType} failed validation`;
    }
}
