import { LoggerService, Message, MqttConsumer, MqttService } from "@powerpi/common";
import { Service } from "typedi";
import Container from "../Container";
import MqttModel from "../models/mqtt.model";

@Service()
export default class MessageWriterService implements MqttConsumer {
    private readonly mqtt: MqttService;
    private readonly logger: LoggerService;

    constructor() {
        this.mqtt = Container.get(MqttService);
        this.logger = Container.get(LoggerService);
    }

    public async start() {
        await this.mqtt.subscribe(this);
    }

    public async message(type: string, entity: string, action: string, message: Message) {
        // we don't want to repeat the timestamp
        const timestamp = message.timestamp ? new Date(message.timestamp) : undefined;
        delete message.timestamp;

        const record = MqttModel.build({
            type,
            entity,
            action,
            timestamp,
            message,
        } as MqttModel);

        try {
            await record.save();
        } catch (error) {
            this.logger.error(error);
        }
    }
}
