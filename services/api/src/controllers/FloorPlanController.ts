import { Controller, Get } from "@tsed/common";
import Authorize from "../middleware/AuthorizeMiddleware";
import ConfigService from "../services/ConfigService";

@Controller("/floorPlan")
export default class FloorPlanController {
    constructor(private readonly configService: ConfigService) {}

    @Get("/")
    @Authorize()
    getFloorPlan() {
        return this.configService.floorplan?.floorplan;
    }
}
