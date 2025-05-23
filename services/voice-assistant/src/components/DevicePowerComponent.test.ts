import { jest } from "@jest/globals";
import { InputType, TestSuite } from "@jovotech/framework";
import { AlexaPlatform, AlexaUser } from "@jovotech/platform-alexa";
import { mockDeviceFile } from "@powerpi/common-test";
import app from "../app.js";
import ApiService from "../services/ApiService.js";

describe("Alexa", () => {
    const testSuite = new TestSuite({
        app: app,
        platform: AlexaPlatform,
    });

    jest.spyOn(AlexaUser.prototype, "accessToken", "get").mockReturnValue("token");

    test("Start", async () => {
        mockDeviceFile();

        const { response } = await testSuite.run({
            type: InputType.Launch,
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).toMatch(
            "<speak>What would you like to do?</speak>",
        );
    });

    test("Device not found", async () => {
        await testSuite.run({ type: InputType.Launch });

        const { response } = await testSuite.run({
            intent: "DevicePowerIntent",
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).toMatch(
            "<speak>I couldn't find that device, try again</speak>",
        );
    });

    test("Named device not found", async () => {
        mockDeviceFile();

        await testSuite.run({ type: InputType.Launch });

        const { response } = await testSuite.run({
            intent: "DevicePowerIntent",
            entities: {
                deviceName: {
                    id: "lights",
                    value: "lights",
                },
                status: {
                    id: "on",
                    value: "on",
                },
            },
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).toMatch(
            "<speak>I couldn't find device lights, try again</speak>",
        );
    });

    test("API error", async () => {
        mockDeviceFile([
            {
                name: "lights",
                type: "light",
                display_name: "lights",
            },
        ]);

        jest.spyOn(ApiService.prototype, "makeRequest").mockResolvedValue(false);

        await testSuite.run({ type: InputType.Launch });

        const { response } = await testSuite.run({
            intent: "DevicePowerIntent",
            entities: {
                deviceName: {
                    id: "lights",
                    value: "lights",
                },
                status: {
                    id: "on",
                    value: "on",
                },
            },
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).toMatch(
            "<speak>I'm sorry, I was unable to make the request to Power Pi.</speak>",
        );
    });

    [
        ["on", "Starting Hallway Light"],
        ["off", "Stopping Hallway Light"],
    ].forEach(([status, message]) => {
        test(`Turns device ${status}`, async () => {
            mockDeviceFile([
                {
                    name: "hallway_light",
                    type: "light",
                    display_name: "Hallway Light",
                },
            ]);

            jest.spyOn(ApiService.prototype, "makeRequest").mockResolvedValue(true);

            await testSuite.run({ type: InputType.Launch });

            const { response } = await testSuite.run({
                intent: "DevicePowerIntent",
                entities: {
                    deviceName: {
                        id: "hallway_light",
                        value: "Hallway Light",
                    },
                    status: {
                        id: status,
                        value: status,
                    },
                },
            });

            expect(response.response.outputSpeech?.ssml).toBeDefined();
            expect(response.response.outputSpeech?.ssml).toMatch(`<speak>${message}</speak>`);
        });
    });
});
