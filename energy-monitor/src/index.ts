import { MqttService } from "powerpi-common";
import Container from "./container";
import N3rgyService from "./services/n3rgy";

async function start() {
  const n3rgy = Container.get(N3rgyService);
  //const data = await n3rgy.getElecticity();

  const mqtt = Container.get(MqttService);
  mqtt.connect();
}

start();
