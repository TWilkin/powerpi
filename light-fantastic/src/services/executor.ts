import { LoggerService } from "powerpi-common";
import { Settings } from "luxon";
import { Container as RootContainer, Service } from "typedi";
import ConfigService from "./config";
import Container from "../container";
import DeviceSchedule, { DeviceScheduleToken } from "./deviceschedule";

@Service()
export default class ScheduleExecutorService {
    private logger: LoggerService;

    constructor(private config: ConfigService) {
        this.logger = Container.get(LoggerService);
    }

    public start() {
        // find the lights
        const lights = this.config.devices.filter((device) => device.type === "lifx_light");
        this.logger.info(`Found ${lights.length} LIFX lights`);

        lights.forEach((light) => this.logger.info(`Found LIFX light "${light.displayName}"`));

        // load the schedule
        const schedules = this.config.schedules;

        // set the timezone
        Settings.defaultZone = schedules.timezone;

        // configure the devices
        schedules.schedules.map((schedule, i) => {
            const request = RootContainer.of(`DeviceSchedule${i}`);
            request.set(DeviceScheduleToken, {
                device: lights.find((light) => light.name === schedule.device),
                schedule,
            });

            const deviceSchedule = request.get(DeviceSchedule);

            deviceSchedule.start();

            return deviceSchedule;
        });
    }
}
