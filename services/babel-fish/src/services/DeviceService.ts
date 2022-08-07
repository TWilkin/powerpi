import { Service } from "typedi";
import ConfigService from "./ConfigService";

@Service()
export default class DeviceService {
    constructor(
        private config: ConfigService
    ) {}

    get devices() {
        return this.config.devices;
    }

    find(name?: string) {
        if(!name) {
            return undefined;
        }

        const deviceName = this.cleanString(name);

        return this.devices.find(device => 
            this.cleanString(device.displayName) === deviceName
                || this.cleanString(device.name) === deviceName
        );
    }

    cleanString(value?: string) {
        if (!value) {
            return value;
        }
    
        return value.trim().toLowerCase().replace(".", "").replace("-", "");
    }
}
