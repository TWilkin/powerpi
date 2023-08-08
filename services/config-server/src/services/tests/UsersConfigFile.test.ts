import { ConfigFileType } from "@powerpi/common";
import ValidatorService from "../ValidatorService";
import {
    testInvalid as _testInvalid,
    testValid as _testValid,
    setupValidator,
} from "./setupValidator";

describe("Users", () => {
    let subject: ValidatorService | undefined;

    const testValid = (file: object) => _testValid(subject, ConfigFileType.Users, file);
    const testInvalid = (file: object) => _testInvalid(subject, ConfigFileType.Users, file);

    beforeEach(() => (subject = setupValidator()));

    test("Default file", () => testValid({ users: [] }));

    test("Valid file", () =>
        testValid({
            $schema:
                "https://raw.githubusercontent.com/TWilkin/powerpi/main/services/config-server/src/schema/config/users.schema.json",
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
