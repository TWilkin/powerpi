import { ConfigFileType, LoggerService } from "@powerpi/common";
import { MockLoggerService } from "@powerpi/common-test";
import ValidatorService, { ValidationException } from "../../../src/services/ValidatorService";

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
    try {
        const result = await subject?.validate(fileType, file);

        expect(result).toBeTruthy();
    } catch (e) {
        console.error(e);

        // force a fail
        expect(false).toBeTruthy();
    }
}

export async function testInvalid(
    subject: ValidatorService | undefined,
    fileType: ConfigFileType,
    file: object
) {
    const action = async () => await subject?.validate(fileType, file);

    await expect(action).rejects.toThrow(ValidationException);
}
