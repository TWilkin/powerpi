import { AlexaSkill } from "jovo-platform-alexa";
import { getDevices } from "./powerPiConfig";

export async function addDeviceTypes(skill?: AlexaSkill) {
  if (!skill) {
    return;
  }

  const devices = await getDevices();

  const values = devices.map((device) => ({
    name: {
      id: device.name,
      value: device.display_name ?? device.name
    }
  }));

  skill.addDynamicEntityType({
    name: "DeviceInputType",
    values: values
  });
}
