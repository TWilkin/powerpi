import { Device } from "@powerpi/common-api";

export default function getDeviceCapabilities(device: Device) {
    // identify which capabilities the device supports
    const capabilities = {
        brightness: device.capability?.brightness ?? false,
        temperature: false,
        colour:
            (device.capability?.colour?.hue ?? false) &&
            (device.capability?.colour?.saturation ?? false),
        streams: device.capability?.streams !== undefined,
    };

    // also return the list of supports streams
    const streams = device.capability?.streams;

    // and the supported temperature range
    let temperatureRange = { min: 0, max: 0 };
    if (device.capability?.colour?.temperature) {
        capabilities.temperature = true;
        temperatureRange = device.capability?.colour?.temperature as {
            min: number;
            max: number;
        };
    }

    return {
        capabilities,
        temperatureRange,
        streams,
    };
}
