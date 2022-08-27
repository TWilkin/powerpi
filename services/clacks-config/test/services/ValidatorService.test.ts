import { ConfigFileType, LoggerService } from "@powerpi/common";
import { MockLoggerService } from "@powerpi/common-test";
import ValidatorService, { ValidationException } from "../../src/services/ValidatorService";

describe("ValidatorService", () => {
    let subject: ValidatorService | undefined;

    beforeEach(() => (subject = setupValidator()));

    // common tests
    Object.values(ConfigFileType).forEach((fileType) => {
        test(`${fileType} empty`, async () => testInvalid(subject, fileType as ConfigFileType, {}));
    });
});

export function setupValidator() {
    const logger = new MockLoggerService() as unknown as LoggerService;

    const subject = new ValidatorService(logger);

    subject.initialise();

    return subject;
}

export async function testValid(
    subject: ValidatorService | undefined,
    fileType: ConfigFileType,
    file: object
) {
    const result = await subject?.validate(fileType, file);

    expect(result).toBeTruthy();
}

export async function testInvalid(
    subject: ValidatorService | undefined,
    fileType: ConfigFileType,
    file: object
) {
    const action = () => subject?.validate(fileType, file);

    await expect(action).rejects.toThrow(ValidationException);
}
