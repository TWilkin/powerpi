import { MqttService } from "powerpi-common";
import Container from "./container";
import ExecutorService from "./services/executor";

function start() {
  const mqtt = Container.get(MqttService);
  mqtt.connect();

  const executor = Container.get(ExecutorService);
  executor.start();
}

start();
