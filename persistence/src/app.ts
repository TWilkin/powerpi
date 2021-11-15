import { MqttService } from "powerpi-common";
import Container from "./container";
import DbService from "./services/db";
import MessageWriterService from "./services/message";

async function start() {
    const db = Container.get(DbService);
    await db.connect();

    const mqtt = Container.get(MqttService);
    await mqtt.connect();

    const messageWriter = Container.get(MessageWriterService);
    await messageWriter.start();
}

start();
