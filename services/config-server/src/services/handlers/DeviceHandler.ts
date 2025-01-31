import { IDeviceConfigFile, ISensorConfig } from "@powerpi/common";
import { createHash } from "crypto";
import { Service } from "typedi";
import { chain as _ } from "underscore";
import ConfigPublishService from "../ConfigPublishService";
import IHandler from "./IHandler";

@Service()
export default class DeviceHandler implements IHandler<IDeviceConfigFile> {
    constructor(private readonly publishService: ConfigPublishService) {}

    public async handle(config: IDeviceConfigFile) {
        const powerpiSensors = config.sensors?.filter((sensor) => sensor.type === "powerpi");

        if (powerpiSensors) {
            for (const sensor of powerpiSensors) {
                await this.generatePowerPiSensorConfigMessage(sensor);
            }
        }
    }

    private async generatePowerPiSensorConfigMessage(sensor: ISensorConfig) {
        const props = _(sensor)
            .omit("name", "type", "display_name", "location", "metrics", "visible")
            .value();

        const checksum = createHash("sha1").update(JSON.stringify(props)).digest("hex");

        await this.publishService.publishConfigChange(sensor.name, props, checksum);
    }
}
