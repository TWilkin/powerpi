import { IDeviceConfigFile, ISensor } from "@powerpi/common";
import { createHash } from "crypto";
import { Service } from "typedi";
import { chain as _ } from "underscore";
import ConfigPublishService from "../ConfigPublishService";
import IHandler from "./IHandler";

@Service()
export default class DeviceHandler implements IHandler<IDeviceConfigFile> {
    constructor(private readonly publishService: ConfigPublishService) {}

    public async handle(config: IDeviceConfigFile) {
        const sensors = config.sensors?.filter((sensor) => sensor.type === "esp8266");

        if (sensors) {
            for (const sensor of sensors) {
                await this.generateConfigMessage(sensor);
            }
        }
    }

    private async generateConfigMessage(sensor: ISensor) {
        const props = _(sensor)
            .omit("name", "type", "display_name", "location", "entity", "action", "visible")
            .value();

        const checksum = createHash("sha1").update(JSON.stringify(props)).digest("hex");

        await this.publishService.publishConfigChange(sensor.name, props, checksum);
    }
}
