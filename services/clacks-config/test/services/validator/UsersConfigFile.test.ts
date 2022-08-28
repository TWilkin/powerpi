import { ConfigFileType } from "@powerpi/common";
import ValidatorService from "../../../src/services/ValidatorService";
import {
    setupValidator,
    testInvalid as _testInvalid,
    testValid as _testValid,
} from "./setupValidator";

describe("Users", () => {
    let subject: ValidatorService | undefined;

    const testValid = (file: object) => _testValid(subject, ConfigFileType.Users, file);
    const testInvalid = (file: object) => _testInvalid(subject, ConfigFileType.Users, file);

    beforeEach(() => (subject = setupValidator()));

    test("Default file", () => testValid({ users: [] }));

    test("Valid file", () =>
        testValid({
            users: [
                { email: "user@gmail.com", role: "USER" },
                { email: "other@gmail.com", role: "USER" },
            ],
        }));

    test("Other properties", () => testInvalid({ users: [], something: "else" }));

    describe("User", () => {
        test("No email", () => testInvalid({ users: [{ role: "USER" }] }));

        test("No role", () => testInvalid({ users: [{ email: "user@gmail.com" }] }));

        test("Bad role", () =>
            testInvalid({ users: [{ email: "user@gmail.com", role: "SUPERHERO" }] }));

        test("Other properties", () =>
            testInvalid({ users: [{ email: "user@gmail.com", role: "USER", something: "else" }] }));
    });
});
