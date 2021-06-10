import { Log } from "jovo-core";
import { AlexaSkill } from "jovo-platform-alexa";
import { getDevices } from "./powerPiConfig";

export async function addDeviceTypes(skill?: AlexaSkill) {
  if (!skill) {
    return;
  }

  const devices = await getDevices();

  const definition = {
    name: "DeviceInputType",
    values: devices.map((device) => ({
      name: {
        id: device.name,
        value: device.display_name ?? device.name
      }
    }))
  };

  Log.info(
    `Replace ${definition.name} with ${definition.values.length} values.`
  );

  skill.replaceDynamicEntities([definition]);
}
