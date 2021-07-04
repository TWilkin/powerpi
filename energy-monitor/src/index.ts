import { Container } from "typedi";
import ConfigService from "./services/config";

async function start() {
  const config = Container.get(ConfigService);
  console.log(await config.ihdId);
}

start();
