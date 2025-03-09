import { ConfigFileType, LoggerService } from "@powerpi/common";
import addFormats from "ajv-formats";
import { Ajv2020, AnySchema } from "ajv/dist/2020.js";
import { Service } from "typedi";
import loadSchema from "../schema/index.js";

@Service()
export default class ValidatorService {
    private readonly ajv: Ajv2020;

    constructor(private readonly logger: LoggerService) {
        this.ajv = new Ajv2020();
        addFormats.default(this.ajv);
    }

    public async initialise() {
        const { common, devices, schedules, config } = loadSchema();

        this.addSchema(common);
        this.addSchema(devices);
        this.addSchema(schedules);
        this.addSchema(config);
    }

    public async validate(fileType: ConfigFileType, file: object) {
        if (!this.ajv) {
            await this.initialise();
        }

        const validator = this.ajv.getSchema(fileType);

        if (validator) {
            if (validator(file)) {
                return true;
            }

            // failed validation
            throw new ValidationException(
                fileType,
                validator.errors ? JSON.stringify(validator.errors) : undefined,
            );
        } else {
            this.logger.error("Could not find schema for", fileType);
        }

        return false;
    }

    private addSchema(schema: { [key: string]: AnySchema }) {
        for (const type in schema) {
            const key = type as keyof typeof schema;

            const currentSchema = schema[key];

            this.ajv.addSchema(currentSchema, type);
        }
    }
}

export class ValidationException extends Error {
    constructor(
        private readonly fileType: ConfigFileType,
        public readonly errors: string | undefined,
    ) {
        super();
    }

    get message() {
        return `File ${this.fileType} failed validation`;
    }
}
