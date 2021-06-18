import { Jovo } from "jovo-framework";
import { Device } from "powerpi-common-api";
import Alexa from "./alexa";

export function addDeviceTypes(jovo: Jovo, devices: Device[]) {
  if (jovo.$alexaSkill) {
    Alexa.addDeviceTypes(jovo.$alexaSkill!, devices);
  }
}
