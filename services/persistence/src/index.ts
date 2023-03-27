import { MqttService } from "@powerpi/common";
import Container from "./Container";
import DbService from "./services/DbService";
import HealthService from "./services/HealthService";
import MessageWriterService from "./services/MessageWriterService";

async function start() {
    const db = Container.get(DbService);
    await db.connect();

    const mqtt = Container.get(MqttService);
    await mqtt.connect();

    const health = Container.get(HealthService);
    await health.start();

    const messageWriter = Container.get(MessageWriterService);
    await messageWriter.start();
}

start();
