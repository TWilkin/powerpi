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

  get gitHubUser(): string | undefined {
    return process.env["GITHUB_USER"];
  }

  get gitHubPassword(): Promise<string> {
    return this.getSecret("GITHUB");
  }

  get gitHubToken(): Promise<string> {
    return this.getSecret("GITHUB_TOKEN");
  }
}

Container.set(CommonConfigService, new ConfigService());
