import { Controller, Get } from "@tsed/common";
import _ from "underscore";
import Authorize from "../middleware/AuthorizeMiddleware";
import SensorStateService from "../services/SensorStateService";

@Controller("/sensor")
export default class SensorController {
    constructor(private readonly sensorService: SensorStateService) {}

    @Get("/")
    @Authorize()
    getAllSensors() {
        return _(this.sensorService.sensors).sortBy((sensor) =>
            (sensor.display_name ?? sensor.name).toLocaleLowerCase(),
        );
    }
}
