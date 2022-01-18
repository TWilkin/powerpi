import { Controller, Get } from "@tsed/common";
import Authorize from "../middleware/auth";
import SensorService from "../services/sensor";

@Controller("/sensor")
export default class SensorController {
    constructor(private readonly sensorService: SensorService) {}

    @Get("/")
    @Authorize()
    getAllSensors() {
        return this.sensorService.sensors.sort((a, b) => {
            const str1 = (a.display_name ?? a.name).toUpperCase();
            const str2 = (b.display_name ?? b.name).toUpperCase();

            return str1 < str2 ? -1 : str1 > str2 ? 1 : 0;
        });
    }
}
