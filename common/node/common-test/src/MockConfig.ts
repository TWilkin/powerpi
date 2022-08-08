import { IDeviceConfig, ISensor } from "@powerpi/common";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

function mockConfigFile(fileName: string, envVar: string, content: object) {
    process.env["USE_CONFIG_FILE"] = "true";

    const tempFile = join(tmpdir(), fileName);

    writeFileSync(tempFile, JSON.stringify(content));

    process.env[envVar] = tempFile;
}

export function mockDeviceFile(devices: IDeviceConfig[] = [], sensors: ISensor[] = []) {
    const content = {
        devices,
        sensors,
    };

    mockConfigFile("devices.json", "DEVICES_FILE", content);
}
