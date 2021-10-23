import util = require("util");
import fs = require("fs");
import Container, { Service } from "typedi";
import { IntervalParserService } from "./interval";
import { Device, IDevice } from "../models/device";

// allow reading of files using await
const readAsync = util.promisify(fs.readFile);

@Service()
export class ConfigService {
    protected interval: IntervalParserService;

    constructor() {
        this.interval = Container.get(IntervalParserService);
    }

    get service() {
        return "undefined";
    }

    get version() {
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

    async devices(): Promise<Device[]> {
        const file: { devices: IDevice[] } = JSON.parse(
            await this.readFile(process.env["DEVICES_FILE"] as string)
        );

        return file?.devices.map((device) => Object.assign(new Device(), device));
    }

    protected async getSecret(key: string) {
        const file = await this.readFile(process.env[`${key}_SECRET_FILE`] as string);
        return file;
    }

    protected async readFile(filePath: string) {
        return (await readAsync(filePath)).toString().trim();
    }
}
