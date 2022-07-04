import { IDeviceConfigFile, ISensor } from "@powerpi/common";
import { Service } from "typedi";
import IHandler from "./IHandler";

@Service()
export default class DeviceHandler implements IHandler<IDeviceConfigFile> {
    handle(config: IDeviceConfigFile) {
        // find any ESP8266 sensors
        const sensors = config?.sensors?.filter((sensor) => sensor.type === "esp8266");

        if (sensors) {
            for (const sensor of sensors) {
                this.generateConfigMessage(sensor);
            }
        }
    }

    private generateConfigMessage(sensor: ISensor) {
        // broadcast a config message for this sensor
    }
}
