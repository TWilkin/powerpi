import { DeviceState } from "@powerpi/api";
import { Message, MqttConsumer } from "@powerpi/common";
import MqttService from "../mqtt";
import BatteryStateListener, { BatteryMessage } from "./BatteryStateListener";
import CapabilityStateListener, { CapabilityMessage } from "./CapabilityStateListener";

interface StateMessage extends Message {
    state: DeviceState;
}

export default abstract class DeviceStateListener
    extends BatteryStateListener
    implements MqttConsumer<StateMessage>, CapabilityStateListener
{
    constructor(private readonly mqttService: MqttService) {
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
    }

    public message(_: string, entity: string, __: string, message: StateMessage): void {
        this.onDeviceStateMessage(entity, message.state, message.timestamp);
    }

    abstract onCapabilityMessage(entity: string, message: CapabilityMessage): void;

    protected onBatteryMessage = (
        entity: string,
        value: number,
        timestamp?: number,
        charging?: boolean
    ) => this.onDeviceBatteryMessage(entity, value, timestamp, charging);

    protected abstract onDeviceStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp?: number
    ): void;

    protected abstract onDeviceBatteryMessage(
        deviceName: string,
        value: number,
        timestamp?: number,
        charging?: boolean
    ): void;
}
