import { ConfigFileType, ConfigRetrieverService } from "@powerpi/common";
import { capture, instance, mock, resetCalls, when } from "ts-mockito";
import ConfigService from "./ConfigService.js";
import UserService from "./UserService.js";

const mockedConfigService = mock<ConfigService>();
const mockedConfigRetrieverService = mock<ConfigRetrieverService>();

describe("UserService", () => {
    const user1 = { email: "user1@gmail.com", subject: "1" };
    const user2 = { email: "user2@gmail.com", subject: "2" };

    let subject: UserService | undefined;

    function getConfigListener() {
        const listeners = capture(mockedConfigRetrieverService.addListener);

        const listener = listeners.byCallIndex(0);
        return listener[1];
    }

    beforeEach(() => {
        when(mockedConfigService.users).thenReturn({
            users: [
                { email: "user1@gmail.com", role: "USER" },
                { email: "user2@gmail.com", role: "USER" },
            ],
        });

        resetCalls(mockedConfigRetrieverService);

        subject = new UserService(
            instance(mockedConfigService),
            instance(mockedConfigRetrieverService),
        );

        subject.$onInit();
    });

    describe("users", () => {
        test("some", () => expect(subject?.users).toHaveLength(2));

        test("none", () => {
            subject = new UserService(
                instance(mockedConfigService),
                instance(mockedConfigRetrieverService),
            );

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

    test("onConfigChange", () => {
        const listener = getConfigListener();

        when(mockedConfigService.users).thenReturn({
            users: [
                { email: "user1@gmail.com", role: "USER" },
                { email: "user3@gmail.com", role: "USER" },
            ],
        });

        const user1Code = "1234";
        subject?.pushUser(user1Code, user1);

        const user2Code = "4321";
        subject?.pushUser(user2Code, user2);

        listener.onConfigChange(ConfigFileType.Users);

        expect(subject?.users).toHaveLength(2);
        expect(subject?.users[0].email).toBe("user1@gmail.com");
        expect(subject?.users[1].email).toBe("user3@gmail.com");

        // this user is still present so is left alone
        expect(subject?.popUser(user1Code)).toBe(user1);

        // this user was removed so the code was removed
        expect(subject?.popUser(user2Code)).toBeUndefined();
    });
});
