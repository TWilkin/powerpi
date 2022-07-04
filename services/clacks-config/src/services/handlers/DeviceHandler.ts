import { IDeviceConfigFile, ISensor } from "@powerpi/common";
import { Service } from "typedi";
import Container from "../../container";
import ConfigPublishService from "../ConfigPublishService";
import IHandler from "./IHandler";
import { chain as _ } from "underscore";
import { createHash } from "crypto";

@Service()
export default class DeviceHandler implements IHandler<IDeviceConfigFile> {
    private publishService: ConfigPublishService;

    constructor() {
        this.publishService = Container.get(ConfigPublishService);
    }

    handle(config: IDeviceConfigFile) {
        const sensors = config?.sensors?.filter((sensor) => sensor.type === "esp8266");

        if (sensors) {
            for (const sensor of sensors) {
                this.generateConfigMessage(sensor);
            }
        }
    }

    private generateConfigMessage(sensor: ISensor) {
        const props = _(sensor)
            .omit("name", "type", "display_name", "location", "entity", "action", "visible")
            .value();

        const checksum = createHash("sha1").update(JSON.stringify(props)).digest("hex");

        this.publishService.publishConfigChange(sensor.name, props, checksum);
    }
}
