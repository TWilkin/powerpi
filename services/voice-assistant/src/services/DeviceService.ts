import { Service } from "typedi";
import ConfigService from "./ConfigService.js";

@Service()
export default class DeviceService {
    constructor(private readonly config: ConfigService) {}

    get devices() {
        return this.config.devices;
    }

    find(name?: string) {
        if (!name) {
            return undefined;
        }

        const deviceName = this.cleanString(name);

        return this.devices.find(
            (device) =>
                this.cleanString(device.displayName) === deviceName ||
                this.cleanString(device.name) === deviceName,
        );
    }

    cleanString(value?: string) {
        if (!value) {
            return value;
        }

        return value.trim().toLowerCase().replace(".", "").replace("-", "");
    }
}
