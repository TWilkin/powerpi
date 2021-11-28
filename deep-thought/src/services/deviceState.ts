import { Service } from "@tsed/common";
import { Device, DeviceConfig, DeviceState } from "../models/device";
import ConfigService from "./config";
import MqttService from "./mqtt";
import StateListener from "./stateListener";

@Service()
export default class DeviceStateService extends StateListener {
    private _devices: Device[] | undefined;

    constructor(config: ConfigService, mqttService: MqttService) {
        super(config, mqttService);

        this._devices = undefined;
    }

    public get devices() {
        return this._devices ?? [];
    }

    public async $onInit() {
        await this.initialise();

        super.$onInit();
    }

    protected onStateMessage(deviceName: string, state: DeviceState, timestamp: number) {
        const device = this.devices.find((d) => d.name === deviceName);

        if (device) {
            device.state = state;
            device.since = timestamp;
        }
    }

    private async initialise() {
        this._devices = this.config.devices.map((device) => ({
            name: device.name,
            display_name: device.displayName,
            type: device.type,
            visible: device.visible ?? true,
            state: "unknown",
            since: -1,
        }));
    }
}
