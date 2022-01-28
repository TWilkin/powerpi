import { ISensor, Message, MqttConsumer } from "@powerpi/common";
import { Sensor } from "../../models/sensor";
import MqttService from "../mqtt";

interface EventMessage extends Message {
    state?: string;
    value?: number;
    unit?: string;
}

export default abstract class SensorStateListener implements MqttConsumer<EventMessage> {
    private readonly _sensor: Sensor;

    constructor(private readonly mqttService: MqttService, sensor: ISensor) {
        this._sensor = {
            name: sensor.name,
            display_name: sensor.display_name,
            type: sensor.type,
            location: sensor.location,
            entity: sensor.entity ?? sensor.location,
            action: sensor.action ?? sensor.type,
            visible: sensor.visible ?? true,
            state: undefined,
            value: undefined,
            unit: undefined,
            since: -1,
        };
    }

    public get sensor() {
        return this._sensor;
    }

    public async $onInit() {
        await this.mqttService.subscribe("event", this._sensor.entity, this._sensor.action, this);
    }

    public message(_: string, __: string, ___: string, message: EventMessage) {
        if (message.state) {
            this._sensor.state = message.state;
            this._sensor.since = message.timestamp ?? -1;

            this.onSensorStateMessage(this._sensor.name, message.state, message.timestamp);
        } else if (message.value !== undefined && message.unit) {
            this._sensor.value = message.value;
            this._sensor.unit = message.unit;
            this._sensor.since = message.timestamp ?? -1;

            this.onSensorDataMessage(
                this._sensor.name,
                message.value,
                message.unit,
                message.timestamp
            );
        }
    }

    protected abstract onSensorStateMessage(
        sensorName: string,
        state: string,
        timestamp?: number
    ): void;

    protected abstract onSensorDataMessage(
        sensorName: string,
        value: number,
        unit: string,
        timestamp?: number
    ): void;
}
