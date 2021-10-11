import { MqttService } from "powerpi-common";
import Container from "./container";
import ScheduleExecutorService from "./services/executor";

function start() {
  const mqtt = Container.get(MqttService);
  mqtt.connect();

  const executor = Container.get(ScheduleExecutorService);
  executor.start();
}

start();
