import { ConfigFileType } from "@powerpi/common";
import ValidatorService from "../../src/services/ValidatorService";
import { setupValidator, testInvalid } from "./validator/setupValidator";

describe("ValidatorService", () => {
    let subject: ValidatorService | undefined;

    beforeEach(() => (subject = setupValidator()));

    // common tests
    Object.values(ConfigFileType).forEach((fileType) => {
        test(`${fileType} empty`, () => testInvalid(subject, fileType as ConfigFileType, {}));
    });
});
