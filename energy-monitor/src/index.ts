import { LoggerService } from "powerpi-common";
import Container from "./container";
import ConfigService from "./services/config";
import N3rgyService from "./services/n3rgy";

async function start() {
  const n3rgy = Container.get(N3rgyService);
  //const data = await n3rgy.getElecticity();

  const logger = Container.get(LoggerService);
  const config = Container.get(ConfigService);
  logger.init(config);
}

start();
