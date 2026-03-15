import { ISensor, MqttService } from "@powerpi/common";
import { Sensor } from "@powerpi/common-api";
import { Service } from "@tsed/di";
import ApiSocketService from "./ApiSocketService.js";
import ConfigService from "./ConfigService.js";
import SensorStateListener from "./listeners/SensorStateListener.js";

@Service()
export default class SensorStateService extends SensorStateListener {
    private _sensors: Sensor[] | undefined;

    constructor(
        private readonly config: ConfigService,
        mqttService: MqttService,
        private readonly socket: ApiSocketService,
    ) {
        super(mqttService);

        this._sensors = undefined;
    }

    public get sensors() {
        return this._sensors ?? [];
    }

    public async $onInit() {
        this._sensors = this.config.sensors.map(this.initialiseSensor);

        await super.$onInit();
    }

    protected getSensor = (entity: string) =>
        this.sensors.find((sensor) => sensor.entity === entity);

    protected onSensorStateMessage(
        entity: string,
        action: string,
        state: string,
        timestamp?: number,
    ): void {
        const sensor = this.getSensor(entity);

        if (sensor) {
            sensor.data = {
                ...sensor.data,
                [action]: {
                    state,
                    since: timestamp ?? -1,
                },
            };

            this.socket.onEventMessage(sensor.name, action, state, undefined, undefined, timestamp);
        }
    }

    protected onSensorDataMessage(
        entity: string,
        action: string,
        value: number,
        unit: string,
        timestamp?: number,
    ) {
        const sensor = this.getSensor(entity);

        if (sensor) {
            sensor.data = {
                ...sensor.data,
                [action]: {
                    value,
                    unit,
                    since: timestamp ?? -1,
                },
            };

            this.socket.onEventMessage(sensor.name, action, undefined, value, unit, timestamp);
        }
    }

    protected onSensorBatteryMessage(
        entity: string,
        value: number,
        timestamp?: number,
        charging?: boolean,
    ) {
        const sensor = this.getSensor(entity);

        if (sensor) {
            sensor.battery = value;
            sensor.batterySince = timestamp ?? -1;
            sensor.charging = charging;

            this.socket.onBatteryMessage(
                "sensor",
                sensor.name,
                sensor.battery,
                sensor.charging,
                timestamp,
            );
        }
    }

    /** The options a sensor should have when it's first loaded. */
    private readonly initialiseSensor = (sensor: ISensor): Sensor => ({
        ...this.defaultSensor(sensor),
        display_name: sensor.displayName ?? sensor.name,
        data: {},
        battery: undefined,
        batterySince: undefined,
        charging: false,
    });

    /** The sensor options with values for any that have defaults. */
    private readonly defaultSensor = (sensor: ISensor) => ({
        ...sensor,
        entity: sensor.entity ?? sensor.name,
        action: sensor.action ?? sensor.type,
        visible: sensor.visible ?? true,
    });
}
