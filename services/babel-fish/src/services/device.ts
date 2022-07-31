import { Service } from "typedi";
import ConfigService from "./config";

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
            this.cleanString(device.displayName) === name
                || this.cleanString(device.name) === name
        );
    }

    cleanString(value?: string) {
        if (!value) {
            return value;
        }
    
        return value.trim().toLowerCase().replace(".", "").replace("-", "");
    }
}
