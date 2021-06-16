import { Log } from "jovo-core";
import { AlexaSkill } from "jovo-platform-alexa";
import PowerPiConfig from "./powerPiConfig";

export async function addDeviceTypes(
  config: PowerPiConfig,
  skill?: AlexaSkill
) {
  if (!skill) {
    return;
  }

  const devices = await config.getDevices();

  const definition = {
    name: "DeviceInputType",
    values: devices.map((device) => ({
      name: {
        id: device.name.toLowerCase(),
        value: device.display_name?.toLowerCase() ?? device.name.toLowerCase()
      }
    }))
  };

  Log.info(
    `Replacing input ${definition.name} with ${definition.values.length} value(s).`
  );

  skill.replaceDynamicEntities([definition]);
}
