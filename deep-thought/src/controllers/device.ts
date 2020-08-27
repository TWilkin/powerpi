import { Controller, Get } from "@tsed/common";

import DeviceStateService from "../services/deviceState";
import { RequiresRole, Role } from "../middleware/auth";

@Controller('/device')
export default class DeviceController {

    constructor(private readonly deviceService: DeviceStateService) { }

    @Get('/')
    @RequiresRole([Role.USER])
    getAllDevices() {
        return this.deviceService.devices
            .sort((a, b) => {
                let str1 = a.name.toUpperCase();
                let str2 = b.name.toUpperCase();

                return str1 < str2 ? -1 : str1 > str2 ? 1 : 0;
            });
    }

};
