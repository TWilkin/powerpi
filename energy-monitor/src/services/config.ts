import { ConfigService as PowerPiConfigService } from "powerpi-common";
import { Service } from "typedi";

@Service()
export default class ConfigService extends PowerPiConfigService {
  get ihdId() {
    return this.getSecret("IHD_SECRET_FILE").then((id) =>
      id.replace(/-|:/g, "").toUpperCase()
    );
  }

  get n3rgyApiBase() {
    return "https://consumer-api.data.n3rgy.com";
  }
}
