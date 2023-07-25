import { Controller, Get } from "@tsed/common";
import Authorize from "../middleware/AuthorizeMiddleware";
import DeviceStateService from "../services/DeviceStateService";

@Controller("/device")
export default class DeviceController {
    constructor(private readonly deviceService: DeviceStateService) {}

    @Get("/")
    @Authorize()
    getAllDevices() {
        return this.deviceService.devices.sort((a, b) => {
            const str1 = (a.display_name ?? a.name).toUpperCase();
            const str2 = (b.display_name ?? b.name).toUpperCase();

            return str1 < str2 ? -1 : str1 > str2 ? 1 : 0;
        });
    }
}