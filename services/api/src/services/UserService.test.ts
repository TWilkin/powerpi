import { instance, mock, when } from "ts-mockito";
import ConfigService from "./ConfigService";
import UserService from "./UserService";

const mockedConfigService = mock<ConfigService>();

describe("UserService", () => {
    const user1 = { email: "user1@gmail.com", subject: "1" };
    const user2 = { email: "user2@gmail.com", subject: "2" };

    let subject: UserService | undefined;

    beforeEach(() => {
        when(mockedConfigService.users).thenReturn({
            users: [
                { email: "user1@gmail.com", role: "USER" },
                { email: "user2@gmail.com", role: "USER" },
            ],
        });

        subject = new UserService(instance(mockedConfigService));

        subject.$onInit();
    });

    describe("users", () => {
        test("some", () => expect(subject?.users).toHaveLength(2));

        test("none", () => {
            subject = new UserService(instance(mockedConfigService));

            expect(subject?.users).toHaveLength(0);
        });
    });

    test("push and pop", () => {
        subject?.pushUser("1234", user1);
        subject?.pushUser("4321", user2);

        let result = subject?.popUser("nope");
        expect(result).toBeUndefined();

        result = subject?.popUser("4321");
        expect(result).toBe(user2);

        result = subject?.popUser("4321");
        expect(result).toBeUndefined();

        result = subject?.popUser("1234");
        expect(result).toBe(user1);

        result = subject?.popUser("1234");
        expect(result).toBeUndefined();
    });
});
