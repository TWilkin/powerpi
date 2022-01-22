import { Controller } from "@tsed/di";
import { Authorize } from "@tsed/passport";
import { Get } from "@tsed/schema";
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
