import { Service } from "@tsed/common";
import { Device, DeviceConfig, DeviceState } from "../models/device";
import Config from "./config";
import MqttService from "./mqtt";
import StateListener from "./stateListener";

@Service()
export default class DeviceStateService extends StateListener {
    private _devices: Device[] | undefined;

    constructor(config: Config, mqttService: MqttService) {
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
        this._devices = (await this.config.getDevices()).map((device: DeviceConfig) => ({
            name: device.name,
            display_name: device.display_name,
            type: device.type,
            visible: device.visible ?? true,
            state: "unknown",
            since: -1,
        }));
    }
}
