import util = require("util");
import fs = require("fs");
import { Service } from "typedi";
import { LogLevel } from "loglevel";

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

  get logLevel() {
    const level = process.env["LOG_LEVEL"]?.trim().toLowerCase();

    switch (level) {
      case "trace":
      case "debug":
      case "info":
      case "warn":
      case "error":
        return level;

      default:
        return "info";
    }
  }

  get mqttAddress() {
    return process.env["MQTT_ADDRESS"] ?? "mqtt://mosquitto:1883";
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
