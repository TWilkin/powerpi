import { Controller, Get } from "@tsed/common";

import Config from "../config";
import { RequiresRole, Role } from "../middleware/auth";

@Controller('/device')
export default class DeviceController {

    private config: Config = new Config();

    @Get('/')
    @RequiresRole([Role.USER])
    async getAllDevices() {
        return (await this.config.getDevices())
            .map((device: any) => ({
                name: device.name,
                type: device.type
            }));
    }

};
