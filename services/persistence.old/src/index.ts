import { MqttService } from "@powerpi/common";
import Container from "./Container.js";
import DbService from "./services/DbService.js";
import HealthService from "./services/HealthService.js";
import MessageWriterService from "./services/MessageWriterService.js";

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
