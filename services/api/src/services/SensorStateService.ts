import { ConfigRetrieverService, ISensor, MqttService, isDefined } from "@powerpi/common";
import { Sensor } from "@powerpi/common-api";
import { Service } from "@tsed/di";
import ApiSocketService from "./ApiSocketService";
import ConfigService from "./ConfigService";
import SensorStateListener from "./listeners/SensorStateListener";

@Service()
export default class SensorStateService extends SensorStateListener {
    private _sensors: Sensor[] | undefined;

    constructor(
        private readonly config: ConfigService,
        configRetriever: ConfigRetrieverService,
        mqttService: MqttService,
        private readonly socket: ApiSocketService,
    ) {
        super(configRetriever, mqttService);

        this._sensors = undefined;
    }

    public get sensors() {
        return this._sensors ?? [];
    }

    public async $onInit() {
        this.initialise();

        await super.$onInit();
    }

    protected getSensor = (entity: string, action: string | undefined = undefined) =>
        this.sensors.find(
            (sensor) =>
                sensor.entity === entity && (action === undefined || sensor.action === action),
        );

    protected onSensorStateMessage(
        entity: string,
        action: string,
        state: string,
        timestamp?: number,
    ): void {
        const sensor = this.getSensor(entity, action);

        if (sensor) {
            sensor.data = {
                ...sensor.data,
                [action]: {
                    state,
                    since: timestamp ?? -1,
                },
            };

            this.socket.onEventMessage(sensor.name, state, undefined, undefined, timestamp);
        }
    }

    protected onSensorDataMessage(
        entity: string,
        action: string,
        value: number,
        unit: string,
        timestamp?: number,
    ) {
        const sensor = this.getSensor(entity, action);

        if (sensor) {
            sensor.data = {
                ...sensor.data,
                [action]: {
                    value,
                    unit,
                    since: timestamp ?? -1,
                },
            };

            this.socket.onEventMessage(sensor.name, undefined, value, unit, timestamp);
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

    protected onConfigChange() {
        // get the new list of sensors
        const sensors = this.config.sensors;

        // now we want to merge the sensors with the list we already have
        const updatedSensors: Sensor[] = this.sensors
            .map((sensor) => {
                // find the new config
                const newConfig = sensors.find((config) => config.name === sensor.name);

                // if there is no config this sensor was removed
                if (!newConfig) {
                    return undefined;
                }

                // otherwise merge them
                return {
                    ...sensor,
                    ...this.defaultSensor(newConfig),
                    display_name: newConfig.displayName ?? sensor.display_name,
                };
            })
            .filter(isDefined);

        // find any new sensors
        const newSensors = sensors
            .filter(
                (sensor) =>
                    (updatedSensors?.find((updated) => updated.name === sensor.name) ?? -1) === -1,
            )
            .map(this.initialiseSensor);

        // finally store the new list
        this._sensors = updatedSensors.concat(newSensors);
    }

    private initialise() {
        this._sensors = this.config.sensors.map(this.initialiseSensor);
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
