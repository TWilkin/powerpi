import {
    ConfigFileType,
    ConfigRetrieverService,
    Message,
    MqttConsumer,
    MqttService,
} from "@powerpi/common";
import { AdditionalState, DeviceState } from "@powerpi/common-api";
import BatteryStateListener, { BatteryMessage } from "./BatteryStateListener";
import CapabilityStateListener, { CapabilityMessage } from "./CapabilityStateListener";
import DeviceChangeListener, { ChangeMessage } from "./DeviceChangeListener";

export interface StateMessage extends Message, AdditionalState {
    state: DeviceState;
}

export default abstract class DeviceStateListener
    extends BatteryStateListener
    implements MqttConsumer<StateMessage>, CapabilityStateListener, DeviceChangeListener
{
    constructor(
        private readonly configRetriever: ConfigRetrieverService,
        private readonly mqttService: MqttService,
    ) {
        super();
    }

    public async $onInit() {
        await this.mqttService.subscribe("device", "+", "status", this);

        await this.mqttService.subscribe("device", "+", "battery", {
            message: (_: string, entity: string, __: string, message: BatteryMessage) =>
                this.batteryMessage(entity, message),
        });

        await this.mqttService.subscribe("device", "+", "capability", {
            message: (_: string, entity: string, __: string, message: CapabilityMessage) =>
                this.onCapabilityMessage(entity, message),
        });

        await this.mqttService.subscribe("device", "+", "change", {
            message: (_: string, entity: string, __: string, message: ChangeMessage) =>
                this.onDeviceChangeMessage(entity, message),
        });

        this.configRetriever.addListener(ConfigFileType.Devices, {
            onConfigChange: (type: ConfigFileType) => {
                if (type === ConfigFileType.Devices) {
                    this.onConfigChange();
                }
            },
        });
    }

    public message(
        _: string,
        entity: string,
        __: string,
        { state, timestamp, ...additionalState }: StateMessage,
    ): void {
        this.onDeviceStateMessage(entity, state, timestamp, additionalState);
    }

    abstract onCapabilityMessage(entity: string, message: CapabilityMessage): void;

    abstract onDeviceChangeMessage(entity: string, message: ChangeMessage): void;

    protected onBatteryMessage = (
        entity: string,
        value: number,
        timestamp?: number,
        charging?: boolean,
    ) => this.onDeviceBatteryMessage(entity, value, timestamp, charging);

    protected abstract onDeviceStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp?: number,
        additionalState?: AdditionalState,
    ): void;

    protected abstract onDeviceBatteryMessage(
        deviceName: string,
        value: number,
        timestamp?: number,
        charging?: boolean,
    ): void;

    protected abstract onConfigChange(): void;
}
