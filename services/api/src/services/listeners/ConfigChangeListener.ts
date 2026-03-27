import { Message, MqttConsumer, MqttService } from "@powerpi/common";

export type ChangeMessage = Message & {
    payload: object;

    checksum: string;
};

export default abstract class ConfigChangeListener implements MqttConsumer<ChangeMessage> {
    constructor(private readonly mqttService: MqttService) {}

    public async $onInit() {
        await this.mqttService.subscribe("config", "+", "change", this);
    }

    public message(
        _: string,
        entity: string,
        __: string,
        { payload, checksum, timestamp }: ChangeMessage,
    ): void {
        this.onConfigChangeMessage(entity, payload, checksum, timestamp);
    }

    protected abstract onConfigChangeMessage(
        entity: string,
        payload: object,
        checksum: string,
        timestamp?: number,
    ): void;
}
