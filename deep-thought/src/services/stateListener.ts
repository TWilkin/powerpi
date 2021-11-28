import { Message, MqttConsumer } from "powerpi-common";
import { DeviceState } from "../models/device";
import MqttService from "./mqtt";

export default abstract class StateListener implements MqttConsumer {
    constructor(private readonly mqttService: MqttService) {}

    public async $onInit() {
        await this.mqttService.subscribe("device", "+", "status", this);
    }

    public message(type: string, entity: string, action: string, message: Message): void {
        this.onStateMessage(entity, message.state, message.timestamp);
    }

    protected abstract onStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp?: number
    ): void;
}
