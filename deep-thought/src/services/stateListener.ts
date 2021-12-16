import { Message, MqttConsumer } from "@powerpi/common";
import { DeviceState } from "../models/device";
import MqttService from "./mqtt";

interface StateMessage extends Message {
    state: DeviceState;
}

export default abstract class StateListener implements MqttConsumer<StateMessage> {
    constructor(private readonly mqttService: MqttService) {}

    public async $onInit() {
        await this.mqttService.subscribe("device", "+", "status", this);
    }

    public message(_: string, entity: string, __: string, message: StateMessage): void {
        this.onStateMessage(entity, message.state, message.timestamp);
    }

    protected abstract onStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp?: number
    ): void;
}
