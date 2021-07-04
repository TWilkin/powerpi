import { ConfigService, Container } from "powerpi-common";

function start() {
  const config = Container.get(ConfigService);
  console.log("Hello World");
}

start();
