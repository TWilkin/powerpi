import jwt from "jsonwebtoken";
import { instance, mock, resetCalls, verify, when } from "ts-mockito";
import ConfigService from "./ConfigService.js";
import JwtService from "./JwtService.js";

const mockedConfigService = mock<ConfigService>();

describe("JwtService", () => {
    let subject: JwtService | undefined;

    beforeEach(() => {
        when(mockedConfigService.externalUrlBase).thenReturn("http://myapp.com");
        when(mockedConfigService.getJWTSecret()).thenResolve("jwt secret");

        resetCalls(mockedConfigService);

        subject = new JwtService(instance(mockedConfigService));
    });

    test("cookieKey", () => expect(JwtService.cookieKey).toBe("jwt"));

    test("audience", () => expect(subject?.audience).toBe("http://myapp.com"));

    test("issuer", () => expect(subject?.issuer).toBe("http://myapp.com"));

    test("createJWT", async () => {
        const spy = vi.spyOn(jwt, "sign").mockImplementation(() => "this is a token");

        const result = await subject?.createJWT(
            { email: "someone@gmail.com", subject: "my subject" },
            "google",
        );

        expect(result).toBe("this is a token");

        verify(mockedConfigService.getJWTSecret()).once();

        expect(spy).toHaveBeenCalledWith(
            { email: "someone@gmail.com", provider: "google" },
            "jwt secret",
            {
                audience: "http://myapp.com",
                issuer: "http://myapp.com",
                expiresIn: "30 days",
                subject: "my subject",
            },
        );
    });

    test("parse", async () => {
        const token = { email: "someone@gmail.com" };

        const spy = vi.spyOn(jwt, "verify").mockImplementation(() => token);

        const result = await subject?.parse("this is a token");

        expect(result).toStrictEqual(token);

        verify(mockedConfigService.getJWTSecret()).once();

        expect(spy).toHaveBeenCalledWith("this is a token", "jwt secret");
    });
});
