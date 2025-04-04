import { BaseComponent, Component, Intents } from "@jovotech/framework";
import { DeviceState } from "@powerpi/common-api";
import Container from "../container.js";
import ApiService from "../services/ApiService.js";
import DeviceService from "../services/DeviceService.js";
import ErrorComponent from "./ErrorComponent.js";

@Component()
export default class DevicePowerComponent extends BaseComponent {
    START() {
        const deviceService = Container.get(DeviceService);
        const devices = deviceService.devices
            ?.filter((device) => device.name !== undefined)
            .map((device) => ({
                id: device.name,
                value:
                    deviceService.cleanString(device.displayName) ??
                    deviceService.cleanString(device.name) ??
                    "",
            }));

        return this.$send({
            message: "What would you like to do?",
            listen: {
                entities: {
                    mode: "REPLACE",
                    types: {
                        DeviceType: {
                            values: devices,
                        },
                    },
                },
            },
        });
    }

    @Intents(["DevicePowerIntent"])
    async action() {
        const deviceService = Container.get(DeviceService);
        const device = deviceService.find(this.$entities.deviceName?.id);
        const status = this.$entities.status?.id;

        if (device && status) {
            const apiService = Container.get(ApiService);

            const success = await apiService.makeRequest(this.$alexa?.$user.accessToken, (api) =>
                api.postDeviceChange(device.name, status as DeviceState),
            );

            if (!success) {
                return this.$redirect(ErrorComponent, "apiError");
            }

            return this.$send({
                message: `${status === "on" ? "Starting" : "Stopping"} ${device?.displayName}`,
                listen: false,
            });
        }

        // not found
        const deviceMessage = this.$entities.deviceName?.value
            ? `device ${this.$entities.deviceName.value}`
            : "that device";
        return this.$send({ message: `I couldn't find ${deviceMessage}, try again` });
    }

    UNHANDLED() {
        return this.START();
    }
}
