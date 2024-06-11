import { ConfigRetrieverService, IDevice, MqttService, isDefined } from "@powerpi/common";
import { AdditionalState, Device, DeviceState } from "@powerpi/common-api";
import { Service } from "@tsed/common";
import ApiSocketService from "./ApiSocketService";
import ConfigService from "./ConfigService";
import { CapabilityMessage } from "./listeners/CapabilityStateListener";
import DeviceStateListener from "./listeners/DeviceStateListener";

@Service()
export default class DeviceStateService extends DeviceStateListener {
    private _devices: Device[] | undefined;

    constructor(
        private readonly config: ConfigService,
        configRetriever: ConfigRetrieverService,
        mqttService: MqttService,
        private readonly socket: ApiSocketService,
    ) {
        super(configRetriever, mqttService);

        this._devices = undefined;
    }

    public get devices() {
        return this._devices ?? [];
    }

    public async $onInit() {
        this.initialise();

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

    protected onConfigChange() {
        // get the new list of devices
        const devices = this.config.devices;

        // now we want to merge the devices with the list we already have
        const updatedDevices: Device[] = this.devices
            .map((device) => {
                // find the new config
                const newConfig = devices.find((config) => config.name === device.name);

                // if there is no config this device was removed
                if (!newConfig) {
                    return undefined;
                }

                // otherwise merge them
                return {
                    ...device,
                    ...this.defaultDevice(newConfig),
                    display_name: newConfig.displayName ?? device.display_name,
                };
            })
            .filter(isDefined);

        // find any new devices
        const newDevices = devices
            .filter(
                (device) =>
                    (updatedDevices?.find((updated) => updated.name === device.name) ?? -1) === -1,
            )
            .map(this.initialiseDevice);

        // finally store the new list
        this._devices = updatedDevices.concat(newDevices);
    }

    private initialise() {
        this._devices = this.config.devices.map(this.initialiseDevice);
    }

    private initialiseDevice = (device: IDevice): Device => ({
        ...this.defaultDevice(device),
        display_name: device.displayName,
        state: DeviceState.Unknown,
        since: -1,
        battery: undefined,
        batterySince: undefined,
        charging: false,
    });

    private defaultDevice = (device: IDevice) => ({
        ...device,
        visible: device.visible ?? true,
    });
}
