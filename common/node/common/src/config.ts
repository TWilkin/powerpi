import util = require("util");
import fs = require("fs");
import { Service } from "typedi";

// allow reading of files using await
const readAsync = util.promisify(fs.readFile);

@Service()
export default class ConfigService {
  get service(): string {
    return "undefined";
  }

  get version(): string {
    return "undefined";
  }

  get mqttAddress() {
    return process.env["MQTT_ADDRESS"];
  }

  get topicNameBase() {
    return process.env["TOPIC_BASE"] ?? "powerpi";
  }

  protected async getSecret(key: string): Promise<string> {
    const file = await this.readFile(process.env[key] as string);
    return file;
  }

  protected async readFile(filePath: string): Promise<string> {
    return (await readAsync(filePath)).toString().trim();
  }
}
