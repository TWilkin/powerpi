import { Controller, Get } from "@tsed/common";

import Config from "../services/config";
import { RequiresRole, Role } from "../middleware/auth";

interface Device {
    name: string;
    type: string;
}

@Controller('/device')
export default class DeviceController {

    constructor(private readonly config: Config) { }

    @Get('/')
    @RequiresRole([Role.USER])
    async getAllDevices() {
        return (await this.config.getDevices())
            .map((device: any) => ({
                name: device.name,
                type: device.type
            } as Device))
            .sort((a: Device, b: Device) => {
                let str1 = a.name.toUpperCase();
                let str2 = b.name.toUpperCase();

                return str1 < str2 ? -1 : str1 > str2 ? 1 : 0;
            });
    }

};
