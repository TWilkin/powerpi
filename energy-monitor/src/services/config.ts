import { ConfigService as PowerPiConfigService } from "powerpi-common";
import { Service } from "typedi";
import app = require("../../package.json");
import Container from "../container";

@Service()
export default class ConfigService extends PowerPiConfigService {
  get service() {
    return app.name;
  }

  get version() {
    return app.version;
  }

  get ihdId() {
    return this.getSecret("IHD_SECRET_FILE").then((id) =>
      id.replace(/-|:/g, "").toUpperCase()
    );
  }

  get n3rgyApiBase() {
    return "https://consumer-api.data.n3rgy.com";
  }
}

Container.set(PowerPiConfigService, new ConfigService());
