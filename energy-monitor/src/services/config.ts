import {
  ConfigService as PowerPiConfigService,
  IntervalParserService
} from "powerpi-common";
import { Service } from "typedi";
import app = require("../../package.json");
import Container from "../container";

@Service()
export default class ConfigService extends PowerPiConfigService {
  private interval: IntervalParserService;

  constructor() {
    super();

    this.interval = Container.get(IntervalParserService);
  }

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
    return (
      process.env["N3RGY_API_BASE"] ?? "https://consumer-api.data.n3rgy.com"
    );
  }

  get retryInterval() {
    const str = process.env["RETRY_INTERVAL"] ?? "2 hours";
    return this.interval.parse(str);
  }

  get timeoutOffset() {
    const str = process.env["TIMEOUT_OFFSET"] ?? "30 minutes";
    return this.interval.parse(str);
  }
}

Container.set(PowerPiConfigService, new ConfigService());
