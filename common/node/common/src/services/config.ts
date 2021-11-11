import fs from "fs";
import Container, { Service } from "typedi";
import util from "util";
import { Device, IDevice } from "../models/device";
import { ISchedule } from "../models/schedule";
import { IntervalParserService } from "./interval";

export enum ConfigFileType {
    Devices = "devices",
    Events = "events",
    Schedules = "schedules",
    Users = "users",
}

// allow reading of files using await
const readAsync = util.promisify(fs.readFile);

@Service()
export class ConfigService {
    protected interval: IntervalParserService;

    private configs: { [key in ConfigFileType]?: { data: object; checksum: string } };

    constructor() {
        this.interval = Container.get(IntervalParserService);

        this.configs = {};
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

    get configWaitTime() {
        const str = process.env["CONFIG_WAIT_TIME"];
        if (str) {
            return parseInt(str);
        }

        return 2 * 60;
    }

    get configIsNeeded() {
        return true;
    }

    get devices(): IDevice[] {
        const file = this.configs[ConfigFileType.Devices]?.data as { devices: IDevice[] };

        return file?.devices.map((device) => Object.assign(new Device(), device));
    }

    get schedules() {
        return this.configs[ConfigFileType.Schedules]?.data as {
            timezone: string;
            schedules: ISchedule[];
        };
    }

    public get configFileTypes() {
        return Object.values(ConfigFileType);
    }

    public get isPopulated() {
        return this.configFileTypes.every((key) =>
            Object.keys(this.configs).includes(key.toString())
        );
    }

    public getConfig(type: ConfigFileType) {
        return this.configs[type];
    }

    public setConfig(type: ConfigFileType, data: object, checksum: string) {
        this.configs[type] = { data, checksum };
    }

    public getUsedConfig(): ConfigFileType[] {
        throw new Error("Method not implemented.");
    }

    protected async getSecret(key: string) {
        const file = await this.readFile(process.env[`${key}_SECRET_FILE`] as string);
        return file;
    }

    protected async readFile(filePath: string) {
        return (await readAsync(filePath)).toString().trim();
    }
}
