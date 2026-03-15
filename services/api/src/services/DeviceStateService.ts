import { IDevice, MqttService } from "@powerpi/common";
import { AdditionalState, Device, DeviceState } from "@powerpi/common-api";
import { Service } from "@tsed/common";
import { omit } from "underscore";
import ApiSocketService from "./ApiSocketService.js";
import ConfigService from "./ConfigService.js";
import { CapabilityMessage } from "./listeners/CapabilityStateListener.js";
import { ChangeMessage } from "./listeners/DeviceChangeListener.js";
import DeviceStateListener from "./listeners/DeviceStateListener.js";

@Service()
export default class DeviceStateService extends DeviceStateListener {
    private _devices: Device[] | undefined;

    constructor(
        private readonly config: ConfigService,
        mqttService: MqttService,
        private readonly socket: ApiSocketService,
    ) {
        super(mqttService);

        this._devices = undefined;
    }

    public get devices() {
        return this._devices ?? [];
    }

    public async $onInit() {
        this._devices = this.config.devices.map(this.initialiseDevice);

        await super.$onInit();
    }

    protected getDevice = (name: string) => this.devices.find((device) => device.name === name);

    protected onDeviceStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp?: number,
        additionalState?: AdditionalState,
    ) {
        const device = this.getDevice(deviceName);

        if (device) {
            device.state = state;
            device.since = timestamp ?? -1;
            device.additionalState = additionalState;

            this.socket.onDeviceStateMessage(
                device.name,
                device.state,
                timestamp,
                device.additionalState,
            );
        }
    }

    onDeviceChangeMessage(deviceName: string, message: ChangeMessage) {
        const device = this.getDevice(deviceName);

        if (device) {
            this.socket.onDeviceChangeMessage(
                device.name,
                message.state,
                omit(message, "state", "timestamp"),
                message.timestamp,
            );
        }
    }

    protected onDeviceBatteryMessage(
        deviceName: string,
        value: number,
        timestamp?: number,
        charging?: boolean,
    ) {
        const device = this.getDevice(deviceName);

        if (device) {
            device.battery = value;
            device.batterySince = timestamp;
            device.charging = charging;

            this.socket.onBatteryMessage(
                "device",
                device.name,
                device.battery,
                device.charging,
                timestamp,
            );
        }
    }

    onCapabilityMessage(deviceName: string, message: CapabilityMessage): void {
        const device = this.getDevice(deviceName);

        if (device) {
            const capability = { ...message };
            delete capability.timestamp;
            device.capability = capability;

            this.socket.onCapabilityMessage(device.name, device.capability, message.timestamp);
        }
    }

    /** The options a device should have when it's first loaded. */
    private readonly initialiseDevice = (device: IDevice): Device => ({
        ...this.defaultDevice(device),
        display_name: device.displayName,
        state: DeviceState.Unknown,
        since: -1,
        battery: undefined,
        batterySince: undefined,
        charging: false,
    });

    /** The device options with values for any that have defaults. */
    private readonly defaultDevice = (device: IDevice) => ({
        ...device,
        visible: device.visible ?? true,
    });
}
