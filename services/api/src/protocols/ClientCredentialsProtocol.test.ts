import { instance, mock, when } from "ts-mockito";
import { ConfigService } from "../services";
import ClientCredentialsProtocol from "./ClientCredentialsProtocol";

const mockedConfigService = mock<ConfigService>();

describe("ClientCredentialsProtocol", () => {
    let subject: ClientCredentialsProtocol | undefined;

    beforeEach(() => {
        subject = new ClientCredentialsProtocol(instance(mockedConfigService));
    });

    describe("onVerify", () => {
        [
            { clientId: "match", clientSecret: "secretly", expected: true },
            { clientId: "nope", clientSecret: "secretly", expected: false },
            { clientId: "match", clientSecret: "nope", expected: false },
        ].forEach(({ clientId, clientSecret, expected }) =>
            test(`${clientId}:${clientSecret}`, async () => {
                when(mockedConfigService.getAuthConfig()).thenResolve([
                    {
                        name: "other",
                        clientId: "else",
                        clientSecret: "blah",
                    },
                    {
                        name: "oauth",
                        clientId: "match",
                        clientSecret: "secretly",
                    },
                ]);

                const result = await subject?.$onVerify(clientId, clientSecret);
                expect(result).toBe(expected);
            }),
        );

        test("missing", async () => {
            when(mockedConfigService.getAuthConfig()).thenResolve([
                {
                    name: "other",
                    clientId: "else",
                    clientSecret: "blah",
                },
            ]);

            const result = await subject?.$onVerify("match", "secretly");
            expect(result).toBeFalsy();
        });
    });
});
