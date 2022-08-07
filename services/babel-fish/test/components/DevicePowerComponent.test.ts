import { InputType, TestSuite } from "@jovotech/framework";
import { AlexaPlatform, AlexaUser } from "@jovotech/platform-alexa";
import app from "../../src/app";
import ApiService from "../../src/services/ApiService";
import DeviceService from "../../src/services/DeviceService";
import mockDevice from "../util/MockDevice";

describe("Alexa", () => {
    const testSuite = new TestSuite({
        app: app,
        platform: AlexaPlatform,
    });

    jest.spyOn(AlexaUser.prototype, "accessToken", "get").mockReturnValue("token");

    test("Start", async () => {
        mockDevice([]);

        const { response } = await testSuite.run({
            type: InputType.Launch,
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).toMatch(
            "<speak>What would you like to do?</speak>"
        );
    });

    test("Device not found", async () => {
        await testSuite.run({ type: InputType.Launch });

        const { response } = await testSuite.run({
            intent: "DevicePowerIntent",
        });

        expect(response.response.outputSpeech?.ssml).toBeDefined();
        expect(response.response.outputSpeech?.ssml).toMatch(
            "<speak>I couldn't find that device, try again</speak>"
        );
    });

    test("Named device not found", async () => {
        mockDevice([]);

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
            "<speak>I couldn't find device lights, try again</speak>"
        );
    });

    test("API error", async () => {
        jest.spyOn(DeviceService.prototype, "find").mockReturnValue({
            name: "lights",
            type: "light",
            displayName: "lights",
        });

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
            "<speak>I'm sorry, I was unable to make the request to Power Pi.</speak>"
        );
    });

    ["on", "off"].forEach((status) => {
        test(`Turns device ${status}`, async () => {
            jest.spyOn(DeviceService.prototype, "find").mockReturnValue({
                name: "hallway_light",
                type: "light",
                displayName: "Hallway Light",
            });

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
            expect(response.response.outputSpeech?.ssml).toMatch(
                `<speak>Turning Hallway Light ${status}</speak>`
            );
        });
    });
});
