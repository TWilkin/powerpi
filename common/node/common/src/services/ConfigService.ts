import fs from "fs";
import Container, { Service } from "typedi";
import {
    Device,
    IDevice,
    IDeviceConfigFile,
    IFloorplanConfigFile,
    IScheduleConfigFile,
    ISensor,
    IUserConfigFile,
    Sensor,
} from "../models";
import FileService from "./FileService";
import { IntervalParserService } from "./IntervalParserService";

export enum ConfigFileType {
    Devices = "devices",
    Events = "events",
    Floorplan = "floorplan",
    Schedules = "schedules",
    Users = "users",
}

@Service()
export class ConfigService {
    protected interval: IntervalParserService;

    private configs: { [key in ConfigFileType]?: { data: object; checksum: string } };

    constructor(protected readonly fs: FileService) {
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
        const level = this.getEnv("LOG_LEVEL", undefined)?.toLowerCase();

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
        return this.getEnv("MQTT_ADDRESS", "mqtt://mosquitto:1883");
    }

    get mqttUser() {
        return this.getEnv("MQTT_USER", undefined);
    }

    get mqttPassword() {
        if (this.mqttUser) {
            return this.getSecret("MQTT").then((password) => password);
        }

        return undefined;
    }

    get topicNameBase() {
        return this.getEnv("TOPIC_BASE", "powerpi");
    }

    public get databaseSchema() {
        return this.getEnv("DB_SCHEMA", "powerpi");
    }

    get databaseURI() {
        return this.databasePassword.then((password) => {
            return `postgres://${this.databaseUser}:${password}@${this.databaseHost}:${this.databasePort}/${this.databaseSchema}`;
        });
    }

    get healthCheckFile() {
        return this.getEnv("HEALTH_CHECK_FILE", "/home/node/app/powerpi_health");
    }

    get configWaitTime() {
        return this.getEnvInt("CONFIG_WAIT_TIME", 2 * 60);
    }

    get configIsNeeded() {
        return !this.useConfigFile;
    }

    get useConfigFile() {
        return this.getEnvBoolean("USE_CONFIG_FILE", false);
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
            Object.keys(this.configs).includes(key.toString()),
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

    private getEnv<TValueType>(key: string, defaultValue: TValueType) {
        return process.env[key]?.trim() ?? defaultValue;
    }

    protected getEnvInt(key: string, defaultValue: number) {
        const str = this.getEnv(key, undefined);
        if (str) {
            return parseInt(str);
        }

        return defaultValue;
    }

    protected getEnvBoolean(key: string, defaultValue: boolean) {
        return this.getEnv(key, defaultValue ? "true" : "false")?.toLowerCase() === "true";
    }

    protected async getSecret(key: string) {
        const fileName = this.getEnv(`${key}_SECRET_FILE`, undefined);

        if (fileName) {
            const file = await this.readFile(fileName);
            return file;
        } else {
            throw new Error(`Cannot find secret '${key}'`);
        }
    }

    protected async readFile(filePath: string) {
        return (await this.fs.read(filePath)).toString().trim();
    }

    private get databaseHost() {
        return this.getEnv("DB_HOST", "db");
    }

    private get databasePort() {
        return this.getEnvInt("DB_PORT", 5432);
    }

    private get databaseUser() {
        return this.getEnv("DB_USER", "powerpi");
    }

    private get databasePassword() {
        return this.getSecret("DB");
    }

    private fileOrConfig<TConfigFile extends object>(
        key: string,
        type: ConfigFileType,
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
