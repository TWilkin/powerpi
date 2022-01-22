import { Controller, Get } from "@tsed/common";
import Authorize from "../middleware/auth";
import ConfigService from "../services/config";

@Controller("/floorplan")
export default class FloorplanController {
    constructor(private readonly configService: ConfigService) {}

    @Get("/")
    @Authorize()
    getFloorplan() {
        return this.configService.floorplan?.floorplan;
    }
}
