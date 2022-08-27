import { ConfigFileType } from "@powerpi/common";
import ValidatorService from "../../../src/services/ValidatorService";
import {
    setupValidator,
    testInvalid as _testInvalid,
    testValid as _testValid,
} from "../ValidatorService.test";

describe("Users", () => {
    let subject: ValidatorService | undefined;

    const testValid = (file: object) => _testValid(subject, ConfigFileType.Users, file);
    const testInvalid = (file: object) => _testInvalid(subject, ConfigFileType.Users, file);

    beforeEach(() => (subject = setupValidator()));

    test("Default File", () => testValid({ users: [] }));

    test("Valid File", () =>
        testValid({
            users: [
                { email: "user@gmail.com", role: "USER" },
                { email: "other@gmail.com", role: "USER" },
            ],
        }));

    test("No email", () => testInvalid({ users: [{ role: "USER" }] }));

    test("No role", () => testInvalid({ users: [{ email: "user@gmail.com" }] }));

    test("Bad role", () =>
        testInvalid({ users: [{ email: "user@gmail.com", role: "SUPERHERO" }] }));
});
