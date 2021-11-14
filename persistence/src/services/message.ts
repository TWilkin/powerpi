import { Message, MqttConsumer, MqttService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import MqttModel from "../models/mqtt.model";

@Service()
export default class MessageWriterService implements MqttConsumer {
    private readonly mqtt: MqttService;

    constructor() {
        this.mqtt = Container.get(MqttService);
    }

    public async start() {
        await this.mqtt.subscribeToAll(this);
    }

    public async message(type: string, entity: string, action: string, message: Message) {
        // we don't want to repeat the timestamp
        const timestamp = message.timestamp;
        delete message.timestamp;

        const record = new MqttModel({
            type,
            entity,
            action,
            timestamp,
            message: JSON.stringify(message),
        });

        await record.save();
    }
}
