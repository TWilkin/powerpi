import { MqttService } from "@powerpi/common";
import Container from "./Container";
import DbService from "./services/DbService";
import MessageWriterService from "./services/MessageWriterService";

async function start() {
    const db = Container.get(DbService);
    await db.connect();

    const mqtt = Container.get(MqttService);
    await mqtt.connect();

    const messageWriter = Container.get(MessageWriterService);
    await messageWriter.start();
}

start();
