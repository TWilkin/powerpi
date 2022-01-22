import { Controller, Get } from "@tsed/common";
import Authorize from "../middleware/auth";
import ConfigService from "../services/config";

@Controller("/config")
export default class DeviceController {
    constructor(private readonly configService: ConfigService) {}

    @Get("/")
    @Authorize()
    async getConfig() {
        const hasDevices = this.configService.devices?.length > 0;
        const hasFloorplan = this.configService.floorplan?.floorplan !== undefined;
        const hasSensors = this.configService.sensors?.length > 0;

        let hasPersistence: boolean;
        try {
            await this.configService.databaseURI;

            // it worked so the db is configured
            hasPersistence = true;
        } catch {
            hasPersistence = false;
        }

        return {
            hasDevices,
            hasFloorplan,
            hasPersistence,
            hasSensors,
        };
    }
}
