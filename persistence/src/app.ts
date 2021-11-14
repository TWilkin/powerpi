import { MqttService } from "powerpi-common";
import Container from "./container";

async function start() {
    const mqtt = Container.get(MqttService);
    mqtt.connect();

    //await sequelize.sync();

    /*mqttClient.on("message", (topic, message) => {
        console.info(`MQTT received (${topic}):(${message.toString()}`);

        const [, type, entity, action] = topic.split("/", 4);
        const json = JSON.parse(message.toString());

        // we don't want to repeat the timestamp
        const timestamp = json.timestamp;
        delete json.timestamp;

        const record = new MqttModel({
            type,
            entity,
            action,
            timestamp,
            message: JSON.stringify(json),
        });

        record.save();
    });

    mqttClient.subscribe(`${Config.topicNameBase}/#`);*/
}

start();
