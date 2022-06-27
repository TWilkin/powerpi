import { DeviceState } from "@powerpi/api";
import { Message, MqttConsumer } from "@powerpi/common";
import MqttService from "../mqtt";

interface StateMessage extends Message {
    state: DeviceState;
}

export default abstract class DeviceStateListener implements MqttConsumer<StateMessage> {
    constructor(private readonly mqttService: MqttService) {}

    public async $onInit() {
        await this.mqttService.subscribe("device", "+", "status", this);
    }

    public message(_: string, entity: string, __: string, message: StateMessage): void {
        this.onDeviceStateMessage(entity, message.state, message.timestamp);
    }

    protected abstract onDeviceStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp?: number
    ): void;
}
