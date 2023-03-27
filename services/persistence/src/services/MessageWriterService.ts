import { LoggerService, Message, MqttConsumer, MqttService } from "@powerpi/common";
import { Service } from "typedi";
import MqttModel from "../models/mqtt.model";

@Service()
export default class MessageWriterService implements MqttConsumer {
    constructor(private readonly mqtt: MqttService, private readonly logger: LoggerService) {}

    public async start() {
        await this.mqtt.subscribe(this);
    }

    public async message(type: string, entity: string, action: string, message: Message) {
        // we don't want to repeat the timestamp
        const timestamp = message.timestamp ? new Date(message.timestamp) : undefined;

        const updated = { ...message };
        delete updated.timestamp;

        const record = MqttModel.build({
            type,
            entity,
            action,
            timestamp,
            message: updated,
        } as MqttModel);

        try {
            await record.save();
        } catch (error) {
            this.logger.error(error);
        }
    }
}
