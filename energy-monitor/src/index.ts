import { Container } from "typedi";
import N3rgyService from "./services/n3rgy";

async function start() {
  const n3rgy = Container.get(N3rgyService);
  n3rgy.getElecticity();
}

start();
