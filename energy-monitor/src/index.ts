import { MqttService } from "powerpi-common";
import Container from "./container";
import EnergyMonitorService from "./services/monitor";

function start() {
  const mqtt = Container.get(MqttService);
  mqtt.connect();

  const monitor = Container.get(EnergyMonitorService);
  monitor.start();
}

start();
