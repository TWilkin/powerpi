import { Controller, Get } from "@tsed/common";
import _ from "underscore";
import Authorize from "../middleware/AuthorizeMiddleware";
import DeviceStateService from "../services/DeviceStateService";

@Controller("/device")
export default class DeviceController {
    constructor(private readonly deviceService: DeviceStateService) {}

    @Get("/")
    @Authorize()
    getAllDevices() {
        return _(this.deviceService.devices).sortBy((device) =>
            (device.display_name ?? device.name).toLocaleLowerCase(),
        );
    }
}
