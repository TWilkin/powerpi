import { connect } from "mqtt";
import os from "os";

import Config from "./config";
import sequelize from "./db";
import MqttModel from "./models/mqtt.model";

sequelize.sync().then(() => {
    const mqttClient = connect(Config.mqttAddress, {
        clientId: `persistence-${os.hostname}`
    });
    
    mqttClient.on("connect", () => console.info("MQTT client connected"));
    mqttClient.on("error", (error) => {
        console.info(`MQTT client error: ${error}`);
        process.exit(1);
    });
    
    mqttClient.on("message", (topic, message) => {
        console.info(`MQTT received (${topic}):(${message.toString()}`);
    
        const [ , type, entity, action] = topic.split("/", 4);
        const json = JSON.parse(message.toString());
    
        const record = new MqttModel({
            type,
            entity,
            action,
            timestamp: json.timestamp,
            message
        });
    
        record.save();
    });
    
    mqttClient.subscribe(`${Config.topicNameBase}/#`);
});
