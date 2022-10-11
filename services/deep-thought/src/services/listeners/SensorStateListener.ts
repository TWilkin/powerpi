import { Sensor } from "@powerpi/api";
import { ISensor, Message, MqttConsumer } from "@powerpi/common";
import MqttService from "../mqtt";
import BatteryStateListener, { BatteryMessage } from "./BatteryStateListener";

interface EventMessage extends Message {
    state?: string;
    value?: number;
    unit?: string;
}

export default abstract class SensorStateListener
    extends BatteryStateListener
    implements MqttConsumer<EventMessage>
{
    private readonly _sensor: Sensor;

    constructor(private readonly mqttService: MqttService, sensor: ISensor) {
        super();

        this._sensor = {
            name: sensor.name,
            display_name: sensor.display_name ?? sensor.name,
            type: sensor.type,
            location: sensor.location,
            entity: sensor.entity ?? sensor.name,
            action: sensor.action ?? sensor.type,
            visible: sensor.visible ?? true,
            state: undefined,
            value: undefined,
            unit: undefined,
            since: -1,
            battery: undefined,
            batterySince: undefined,
            charging: false,
        };
    }

    public get sensor() {
        return this._sensor;
    }

    public async $onInit() {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        await this.mqttService.subscribe("event", this._sensor.entity!, this._sensor.action!, this);

        await this.mqttService.subscribe("event", this._sensor.entity!, "battery", {
            message: (_: string, __: string, ___: string, message: BatteryMessage) =>
                this.batteryMessage(this.sensor.entity!, message),
        });
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

    protected onBatteryMessage(_: string, value: number, timestamp?: number, charging?: boolean) {
        this._sensor.battery = value;
        this._sensor.batterySince = timestamp;
        this._sensor.charging = charging;

        this.onSensorBatteryMessage(this._sensor.name, value, timestamp, charging);
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

    protected abstract onSensorBatteryMessage(
        sensorName: string,
        value: number,
        timestamp?: number,
        charging?: boolean
    ): void;
}
