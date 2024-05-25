import { ConfigFileType, ConfigRetrieverService, ISensor } from "@powerpi/common";
import { Service } from "@tsed/di";
import ConfigService from "./ConfigService";
import MqttService from "./MqttService";
import SensorStateListener from "./listeners/SensorStateListener";

@Service()
export default class SensorStateService {
    private _sensors: SensorStateListener[] | undefined;

    constructor(
        private readonly config: ConfigService,
        private readonly configRetriever: ConfigRetrieverService,
        private readonly mqttService: MqttService,
    ) {
        this._sensors = undefined;
    }

    public get sensors() {
        return this._sensors?.map((sensor) => sensor.sensor) ?? [];
    }

    public async $onInit() {
        this.initialise();

        const promises = this._sensors!.map((sensor) => sensor.$onInit());

        await Promise.all(promises);
    }

    private initialise() {
        this._sensors = this.config.sensors.map(
            (sensor) =>
                new SensorConsumer(
                    this.config,
                    this.configRetriever,
                    this.mqttService,
                    sensor,
                    (name: string) =>
                        (this._sensors = this._sensors?.filter(
                            (sensor) => sensor.sensor.name !== name,
                        )),
                ),
        );
    }
}

type SensorDestructor = (name: string) => void;

class SensorConsumer extends SensorStateListener {
    private readonly _destructor: SensorDestructor;

    constructor(
        private readonly config: ConfigService,
        configRetriever: ConfigRetrieverService,
        mqttService: MqttService,
        sensor: ISensor,
        destructor: SensorDestructor,
    ) {
        super(configRetriever, mqttService, sensor);

        this._destructor = destructor;
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

    protected onConfigChange(_: ConfigFileType): void {
        const updated = this.config.sensors.find((sensor) => sensor.name === this.sensor.name);

        if (!updated) {
            // we need to destroy this sensor
            this._destructor(this.sensor.name);

            this.onDeInit();

            return;
        }

        this.sensor = {
            ...this.sensor,
            ...updated,
            display_name: updated.display_name ?? this.sensor.display_name,
        };
    }
}
