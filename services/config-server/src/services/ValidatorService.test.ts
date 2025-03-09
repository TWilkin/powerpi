import { ConfigFileType } from "@powerpi/common";
import ValidatorService from "./ValidatorService.js";
import { setupValidator, testInvalid } from "./tests/setupValidator.js";

describe("ValidatorService", () => {
    let subject: ValidatorService | undefined;

    beforeEach(() => (subject = setupValidator()));

    // common tests
    Object.values(ConfigFileType).forEach((fileType) => {
        test(`${fileType} empty`, () => testInvalid(subject, fileType as ConfigFileType, {}));
    });
});
