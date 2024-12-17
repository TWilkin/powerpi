import { Resources } from "i18next";

type SupportedSensor = keyof Resources["translation"]["common"]["sensors"]["labels"];

/** Extract the sensor type from the string, returning the type if it's a support sensor
 * (has a translation) otherwise undefined.
 * @param type The type of sensor to extract the supported type from.
 * @returns The support sensor type or undefined. */
export default function getSensorType(type: string): SupportedSensor | undefined {
    const split = type.split("_");

    let key: string | undefined;
    if (split.length <= 2) {
        key = split.at(-1);
    } else {
        key = split.at(-2);
    }

    if (key && isSupportedSensor(key)) {
        return key;
    }

    return undefined;
}

function isSupportedSensor(type: string): type is SupportedSensor {
    return [
        "door",
        "electricity",
        "gas",
        "humidity",
        "motion",
        "switch",
        "temperature",
        "window",
    ].includes(type);
}
