import { InputType, TestSuite } from "@jovotech/framework";
import { AlexaPlatform, AlexaUser } from "@jovotech/platform-alexa";
import app from "../../src/app";

describe("Alexa", () => {
    const testSuite = new TestSuite({
        app: app,
        platform: AlexaPlatform,
    });

    test("Not logged in", async () => {
        const { response } = await testSuite.run({
            type: InputType.Launch,
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).toMatch(
            "<speak>Please login to your Power Pi account through the Alexa app.</speak>"
        );
    });

    test("Logged in", async () => {
        jest.spyOn(AlexaUser.prototype, "accessToken", "get").mockReturnValue("token");

        const { response } = await testSuite.run({
            type: InputType.Launch,
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).not.toMatch(
            "<speak>Please login to your Power Pi account through the Alexa app.</speak>"
        );
    });
});
