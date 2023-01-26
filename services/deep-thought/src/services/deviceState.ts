import { Device, DeviceState } from "@powerpi/api";
import { Service } from "@tsed/common";
import ConfigService from "./config";
import { CapabilityMessage } from "./listeners/CapabilityStateListener";
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

    protected onDeviceBatteryMessage(
        deviceName: string,
        value: number,
        timestamp?: number,
        charging?: boolean
    ) {
        const device = this.devices.find((d) => d.name === deviceName);

        if (device) {
            device.battery = value;
            device.batterySince = timestamp;
            device.charging = charging;
        }
    }

    onCapabilityMessage(deviceName: string, message: CapabilityMessage): void {
        const device = this.devices.find((d) => d.name === deviceName);

        if (device) {
            const capability = { ...message };
            delete capability.timestamp;
            device.capability = capability;
        }
    }

    private initialise() {
        this._devices = this.config.devices.map((device) => ({
            name: device.name,
            display_name: device.displayName,
            type: device.type,
            visible: device.visible ?? true,
            location: device.location,
            categories: device.categories,
            state: DeviceState.Unknown,
            since: -1,
            battery: undefined,
            batterySince: undefined,
            charging: false,
        }));
    }
}
