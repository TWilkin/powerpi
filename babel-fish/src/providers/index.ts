import { Jovo } from "jovo-framework";
import { Device } from "powerpi-common";
import Alexa from "./alexa";

export function getProviderName(jovo: Jovo) {
    if (jovo.$alexaSkill) {
        return "Alexa";
    }

    return "unknown";
}

export function addDeviceTypes(jovo: Jovo, devices?: Device[]) {
    if (jovo.$alexaSkill && devices) {
        Alexa.addDeviceTypes(jovo.$alexaSkill, devices);
    }
}
