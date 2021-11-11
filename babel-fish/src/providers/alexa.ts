import { Log } from "jovo-core";
import { AlexaSkill } from "jovo-platform-alexa";
import { Device } from "powerpi-common";

export default class Alexa {
    static addDeviceTypes(skill: AlexaSkill, devices: Device[]) {
        const definition = {
            name: "DeviceInputType",
            values: devices.map((device) => ({
                name: {
                    id: device.name.toLowerCase(),
                    value: device.display_name?.toLowerCase() ?? device.name.toLowerCase(),
                },
            })),
        };

        Log.info(`Replacing input ${definition.name} with ${definition.values.length} value(s).`);

        skill.replaceDynamicEntities([definition]);
    }
}
