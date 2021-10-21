import { Device, LoggerService, MqttService } from "powerpi-common";
import { Inject, Service, Token } from "typedi";
import Container from "../container";
import Schedule from "../models/schedule";

interface DeviceScheduleConfig {
    device: Device;
    schedule: Schedule;
    timezone: string;
}

export const DeviceScheduleToken = new Token<DeviceScheduleConfig>("DEVICE_SCHEDULE_TOKEN");

@Service({ transient: true })
export default class DeviceSchedule {
    private mqtt: MqttService;
    private logger: LoggerService;

    private device: Device;
    private schedule: Schedule;
    private timezone: string;

    constructor(@Inject(DeviceScheduleToken) config: DeviceScheduleConfig) {
        this.mqtt = Container.get(MqttService);
        this.logger = Container.get(LoggerService);

        this.device = config.device;
        this.schedule = config.schedule;
        this.timezone = config.timezone;
    }

    public async start() {
        this.logger.info(`Scheduling ${this.device.display_name ?? this.device.name}`);
    }
}
