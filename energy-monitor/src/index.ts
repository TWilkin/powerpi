import { Container } from "typedi";
import N3rgyService from "./services/n3rgy";

async function start() {
  const n3rgy = Container.get(N3rgyService);
  const data = await n3rgy.getElecticity();

  console.log(data.values.length);
}

start();
