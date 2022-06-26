import { Service } from "@tsed/common";
import { Device, DeviceState } from "../models/device";
import ConfigService from "./config";
import DeviceStateListener from "./listeners/DeviceStateListener";
import MqttService from "./mqtt";

@Service()
export default class DeviceStateService extends DeviceStateListener {
    private _devices: Device[] | undefined;

    constructor(private readonly config: ConfigService, mqttService: MqttService) {
        super(mqttService);

        this._devices = undefined;
    }

    public get devices() {
        return this._devices ?? [];
    }

    public async $onInit() {
        this.initialise();

        await super.$onInit();
    }

    protected onDeviceStateMessage(deviceName: string, state: DeviceState, timestamp?: number) {
        const device = this.devices.find((d) => d.name === deviceName);

        if (device) {
            device.state = state;
            device.since = timestamp ?? -1;
        }
    }

    private initialise() {
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