import { Device, DeviceState } from "@powerpi/common-api";
import getDeviceCapabilities from "./getDeviceCapabilities";

describe("getDeviceCapabilities", () => {
    const device: Device = {
        name: "MyDevice",
        display_name: "My Device",
        type: "light",
        visible: true,
        state: DeviceState.Off,
        since: -1,
    };

    const booleans = [true, false, undefined];

    test.each(booleans)("brightness %s", (state) => {
        const result = getDeviceCapabilities({
            ...device,
            capability: {
                brightness: state,
            },
        });

        verify(result.capabilities, state ?? false, false, false, false);
    });

    test.each(booleans)("colour.hue %s", (state) => {
        const result = getDeviceCapabilities({
            ...device,
            capability: {
                colour: { hue: state, saturation: true },
            },
        });

        verify(result.capabilities, false, false, state ?? false, false);
    });

    test.each(booleans)("colour.saturation %s", (state) => {
        const result = getDeviceCapabilities({
            ...device,
            capability: {
                colour: { hue: true, saturation: state },
            },
        });

        verify(result.capabilities, false, false, state ?? false, false);
    });

    test.each(booleans.filter((state) => state !== undefined))("colour.temperature %s", (state) => {
        const result = getDeviceCapabilities({
            ...device,
            capability: {
                colour: {
                    temperature: state
                        ? {
                              min: 20,
                              max: 40,
                          }
                        : undefined,
                },
            },
        });

        verify(result.capabilities, false, state ?? false, false, false);

        expect(result.temperatureRange.min).toBe(state ? 20 : 0);
        expect(result.temperatureRange.max).toBe(state ? 40 : 0);
    });

    test.each(booleans)("streams %s", (state) => {
        const result = getDeviceCapabilities({
            ...device,
            capability: {
                streams: state ? ["Stream1", "Stream2"] : undefined,
            },
        });

        verify(result.capabilities, false, false, false, state ?? false);

        if (state) {
            expect(result.streams).toStrictEqual(["Stream1", "Stream2"]);
        } else {
            expect(result.streams).toBeUndefined();
        }
    });

    function verify(
        capabilities: ReturnType<typeof getDeviceCapabilities>["capabilities"],
        brightness: boolean,
        temperature: boolean,
        colour: boolean,
        streams: boolean,
    ) {
        expect(capabilities.brightness).toBe(brightness);
        expect(capabilities.temperature).toBe(temperature);
        expect(capabilities.colour).toBe(colour);
        expect(capabilities.streams).toBe(streams);
    }
});
