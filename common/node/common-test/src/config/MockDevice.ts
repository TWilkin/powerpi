import { IDevice, ISensor } from "@powerpi/common";
import mockFile from "./MockFile";

export default function mockDevice(devices: IDevice[] = [], sensors: ISensor[] = []) {
    const content = {
        devices,
        sensors,
    };

    mockFile("devices.json", "DEVICES_FILE", content);
}
