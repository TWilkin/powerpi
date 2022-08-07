import { BaseComponent, Component, Intents } from "@jovotech/framework";
import { DeviceState, PowerPiApi } from "@powerpi/api";
import Container from "../container";
import DeviceService from "../services/DeviceService";
import ErrorComponent from "./ErrorComponent";

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
    async action() {
        const deviceService = Container.get(DeviceService);
        const device = deviceService.find(this.$entities.deviceName?.id);
        const status = this.$entities.status?.id;

        if(device && status) {
            const success = await makeRequest(
                this.$alexa?.$user.accessToken, 
                api => api.postMessage(device.name, status as DeviceState)
            );

            if(!success) {
                return this.$redirect(ErrorComponent, "apiError");
            }

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

async function makeRequest(token: string | undefined, action: (api: PowerPiApi) => Promise<unknown>) {
    const api = new PowerPiApi("http://deep-thought:3000/api");

    if (token) {
        api.setCredentials(token);
    }

    let success = true;
    api.setErrorHandler(() => (success = false));

    await action(api);

    return success;
}
