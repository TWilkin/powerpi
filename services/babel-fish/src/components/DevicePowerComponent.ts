import { BaseComponent, Component, Intents } from "@jovotech/framework";
import Container from "../container";
import DeviceService from "../services/device";

@Component()
export default class DevicePowerComponent extends BaseComponent {
    START() {
        const deviceService = Container.get(DeviceService);
        const devices = deviceService.devices?.map(device => ({
            id: device.name,
            value: deviceService.cleanString(device.displayName) ?? deviceService.cleanString(device.name)!
        }));

        return this.$send({ 
            message: "What would you like to do?",
            listen: {
                entities: {
                    mode: "REPLACE",
                    types: {
                        DeviceType: {
                            values: devices
                        }
                    }
                }
            }
        });
    }

    @Intents(["DevicePowerIntent"])
    action() {
        const deviceService = Container.get(DeviceService);
        const device = deviceService.find(this.$entities.deviceName?.id);
        const status = this.$entities.status?.id;

        if(device && status) {
            return this.$send({ message: `Turning ${device?.displayName} ${status}`, listen: false });
        }

        // not found
        const deviceMessage = this.$entities.deviceName?.value ? `device ${this.$entities.deviceName.value}` : "that device";
        return this.$send({ message: `I couldn't find ${deviceMessage}, try again`});
    }

    UNHANDLED() {
        return this.START();
    }
}
