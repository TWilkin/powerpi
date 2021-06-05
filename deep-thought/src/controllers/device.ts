import { Controller, Get } from "@tsed/common";
import Role from "../roles";
import DeviceStateService from "../services/deviceState";

@Controller("/device")
export default class DeviceController {
  constructor(private readonly deviceService: DeviceStateService) {}

  @Get("/")
  //@RequiresRole([Role.USER])
  getAllDevices() {
    return this.deviceService.devices.sort((a, b) => {
      const str1 = (a.display_name ?? a.name).toUpperCase();
      const str2 = (b.display_name ?? b.name).toUpperCase();

      return str1 < str2 ? -1 : str1 > str2 ? 1 : 0;
    });
  }
}
