import { IDevice } from "@powerpi/common";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export default function mockDevice(devices: IDevice[]) {
    process.env["USE_CONFIG_FILE"] = "true";

    const tempDir = join(tmpdir(), "devices.json");

    writeFileSync(
        tempDir,
        JSON.stringify({
            devices: devices,
        })
    );

    console.log(tempDir);

    process.env["DEVICES_FILE"] = tempDir;
}
