import { ConfigService as CommonConfigService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import app from "../../package.json";

@Service()
export default class ConfigService extends CommonConfigService {
  get service() {
    return app.name;
  }

  get version() {
    return app.version;
  }
}

Container.set(CommonConfigService, new ConfigService());
