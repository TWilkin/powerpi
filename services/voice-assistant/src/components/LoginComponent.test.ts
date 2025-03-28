import { jest } from "@jest/globals";
import { InputType, TestSuite } from "@jovotech/framework";
import { AlexaPlatform, AlexaUser } from "@jovotech/platform-alexa";
import { mockDeviceFile } from "@powerpi/common-test";
import app from "../app.js";
import DeviceService from "../services/DeviceService.js";

describe("Alexa", () => {
    const testSuite = new TestSuite({
        app: app,
        platform: AlexaPlatform,
    });

    mockDeviceFile();

    test("Not logged in", async () => {
        const { response } = await testSuite.run({
            type: InputType.Launch,
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).toMatch(
            "<speak>Please login to your Power Pi account through the Alexa app.</speak>",
        );
    });

    test("Logged in", async () => {
        jest.spyOn(AlexaUser.prototype, "accessToken", "get").mockReturnValue("token");

        jest.spyOn(DeviceService.prototype, "find").mockReturnValue({
            name: "lights",
            type: "lights",
            displayName: "lights",
        });

        const { response } = await testSuite.run({
            type: InputType.Launch,
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).not.toMatch(
            "<speak>Please login to your Power Pi account through the Alexa app.</speak>",
        );
    });
});
