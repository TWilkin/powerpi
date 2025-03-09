import { Controller, Get } from "@tsed/common";
import Authorize from "../middleware/AuthorizeMiddleware.js";
import ConfigService from "../services/ConfigService.js";

@Controller("/floorPlan")
export default class FloorPlanController {
    constructor(private readonly configService: ConfigService) {}

    @Get("/")
    @Authorize()
    getFloorPlan() {
        return this.configService.floorplan?.floorplan;
    }
}
