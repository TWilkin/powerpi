import { Message, MqttConsumer } from "@powerpi/common";
import { Service } from "@tsed/di";
import { Sensor } from "../models/sensor";
import ConfigService from "./config";
import MqttService from "./mqtt";

@Service()
export default class SensorStateService {
    private _sensors: SensorConsumer[] | undefined;

    constructor(private readonly config: ConfigService, private readonly mqttService: MqttService) {
        this._sensors = undefined;
    }

    public get sensors() {
        return this._sensors?.map((sensor) => sensor.sensor) ?? [];
    }

    public async $onInit() {
        this.initialise();

        await Promise.all(this._sensors?.map((sensor) => sensor.initialise()) ?? []);
    }

    private initialise() {
        this._sensors = this.config.sensors.map(
            (sensor) =>
                new SensorConsumer(this.mqttService, {
                    name: sensor.name,
                    display_name: sensor.display_name,
                    type: sensor.type,
                    location: sensor.location,
                    visible: sensor.visible ?? true,
                    state: undefined,
                    value: undefined,
                    unit: undefined,
                    since: -1,
                })
        );
    }
}

interface EventMessage extends Message {
    state?: string;
    value?: number;
    unit?: string;
}

class SensorConsumer implements MqttConsumer {
    constructor(private readonly mqttService: MqttService, private _sensor: Sensor) {}

    public get sensor() {
        return this._sensor;
    }

    public async initialise() {
        await this.mqttService.subscribe("event", this._sensor.location, this._sensor.type, this);
    }

    public message(_: string, __: string, ___: string, message: EventMessage) {
        if (message.state) {
            this._sensor.state = message.state;
            this._sensor.since = message.timestamp ?? -1;
        } else if (message.value !== undefined && message.unit) {
            this._sensor.value = message.value;
            this._sensor.unit = message.unit;
            this._sensor.since = message.timestamp ?? -1;
        }
    }
}
