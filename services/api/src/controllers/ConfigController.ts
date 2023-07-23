import { Controller, Get } from "@tsed/common";
import Authorize from "../middleware/AuthorizeMiddleware";
import ConfigService from "../services/ConfigService";

@Controller("/config")
export default class ConfigController {
    constructor(private readonly configService: ConfigService) {}

    @Get("/")
    @Authorize()
    async getConfig() {
        const hasDevices = this.configService.devices?.length > 0;
        const hasFloorplan = this.configService.floorplan?.floorplan !== undefined;
        const hasSensors = this.configService.sensors?.length > 0;
        const hasPersistence = await this.configService.hasPersistence();

        return {
            hasDevices,
            hasFloorplan,
            hasPersistence,
            hasSensors,
        };
    }
}
