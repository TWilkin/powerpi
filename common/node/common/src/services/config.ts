import fs from "fs";
import Container, { Service } from "typedi";
import util from "util";
import {
    IDeviceConfigFile,
    IFloorplanConfigFile,
    IScheduleConfigFile,
    IUserConfigFile,
} from "../models/config";
import { Device, IDevice } from "../models/device";
import { ISensor, Sensor } from "../models/sensor";
import { IntervalParserService } from "./interval";

export enum ConfigFileType {
    Devices = "devices",
    Events = "events",
    Floorplan = "floorplan",
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

    public get databaseSchema() {
        return process.env["DB_SCHEMA"] ?? "powerpi";
    }

    get databaseURI() {
        return this.databasePassword.then((password) => {
            return `postgres://${this.databaseUser}:${password}@${this.databaseHost}:${this.databasePort}/${this.databaseSchema}`;
        });
    }

    get configWaitTime() {
        const str = process.env["CONFIG_WAIT_TIME"];
        if (str) {
            return parseInt(str);
        }

        return 2 * 60;
    }

    get configIsNeeded() {
        return !this.useConfigFile;
    }

    get useConfigFile() {
        return process.env["USE_CONFIG_FILE"]?.toLowerCase() === "true";
    }

    get devices(): IDevice[] {
        const file = this.fileOrConfig<IDeviceConfigFile>("DEVICES_FILE", ConfigFileType.Devices);

        return file.devices?.map((device) => Object.assign(new Device(), device)) ?? [];
    }

    get sensors(): ISensor[] {
        const file = this.fileOrConfig<IDeviceConfigFile>("DEVICES_FILE", ConfigFileType.Devices);

        return file.sensors?.map((sensor) => Object.assign(new Sensor(), sensor)) ?? [];
    }

    get floorplan() {
        return this.fileOrConfig<IFloorplanConfigFile>("FLOORPLAN_FILE", ConfigFileType.Floorplan);
    }

    get schedules() {
        return this.fileOrConfig<IScheduleConfigFile>("SCHEDULES_FILE", ConfigFileType.Schedules);
    }

    get users() {
        return this.fileOrConfig<IUserConfigFile>("USERS_FILE", ConfigFileType.Users);
    }

    public get configFileTypes() {
        return Object.values(ConfigFileType);
    }

    public get isPopulated() {
        return this.getUsedConfig().every((key) =>
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
        const fileName = process.env[`${key}_SECRET_FILE`];

        if (fileName) {
            const file = await this.readFile(fileName);
            return file;
        } else {
            throw new Error(`Cannot find secret '${key}'`);
        }
    }

    protected async readFile(filePath: string) {
        return (await readAsync(filePath)).toString().trim();
    }

    private get databaseHost() {
        return process.env["DB_HOST"] ?? "db";
    }

    private get databasePort() {
        const str = process.env["DB_PORT"];
        if (str) {
            return parseInt(str);
        }

        return 5432;
    }

    private get databaseUser() {
        return process.env["DB_USER"] ?? "powerpi";
    }

    private get databasePassword() {
        return this.getSecret("DB");
    }

    private fileOrConfig<TConfigFile extends object>(
        key: string,
        type: ConfigFileType
    ): TConfigFile {
        if (this.useConfigFile) {
            const filePath = process.env[key];

            if (filePath) {
                const file = fs.readFileSync(filePath).toString().trim();
                return JSON.parse(file);
            }
        }

        return this.getConfig(type)?.data as TConfigFile;
    }
}
