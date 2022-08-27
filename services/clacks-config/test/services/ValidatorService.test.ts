import { ConfigFileType, LoggerService } from "@powerpi/common";
import { MockLoggerService } from "@powerpi/common-test";
import ValidatorService, { ValidationException } from "../../src/services/ValidatorService";

describe("ValidatorService", () => {
    let subject: ValidatorService | undefined;

    beforeEach(() => {
        const logger = new MockLoggerService() as unknown as LoggerService;

        subject = new ValidatorService(logger);

        subject.initialise();
    });

    // common tests
    Object.values(ConfigFileType).forEach((fileType) => {
        test(`${fileType} empty`, async () => {
            const action = () => subject?.validate(fileType as ConfigFileType, {});

            await expect(action).rejects.toThrow(ValidationException);
        });
    });
});
