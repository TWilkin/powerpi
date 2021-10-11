import { Service } from "typedi";
import ConfigService from "./config";

@Service()
export default class ExecutorService {
  constructor(private config: ConfigService) {}

  public start() {
    // TODO
  }
}
