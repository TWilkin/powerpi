import { ISensor } from "@powerpi/common";
import { Service } from "@tsed/di";
import ConfigService from "./ConfigService";
import MqttService from "./MqttService";
import SensorStateListener from "./listeners/SensorStateListener";

@Service()
export default class SensorStateService {
    private _sensors: SensorStateListener[] | undefined;

    constructor(
        private readonly config: ConfigService,
        private readonly mqttService: MqttService,
    ) {
        this._sensors = undefined;
    }

    public get sensors() {
        return this._sensors?.map((sensor) => sensor.sensor) ?? [];
    }

    public async $onInit() {
        this.initialise();

        await Promise.all(this._sensors?.map((sensor) => sensor.$onInit()) ?? []);
    }

    private initialise() {
        this._sensors = this.config.sensors.map(
            (sensor) => new SensorConsumer(this.mqttService, sensor),
        );
    }
}

class SensorConsumer extends SensorStateListener {
    constructor(mqttService: MqttService, sensor: ISensor) {
        super(mqttService, sensor);
    }

    protected onSensorStateMessage(_: string, __: string, ___?: number): void {
        return;
    }

    protected onSensorDataMessage(_: string, __: number, ___: string, ____?: number): void {
        return;
    }

    protected onSensorBatteryMessage(_: string, __: number, ___?: number): void {
        return;
    }
}
