import {
    ConfigChangeListener,
    ConfigFileType,
    ConfigRetrieverService,
    ISensor,
    Message,
    MqttConsumer,
} from "@powerpi/common";
import { Sensor } from "@powerpi/common-api";
import MqttService from "../MqttService";
import BatteryStateListener, { BatteryMessage } from "./BatteryStateListener";

export interface EventMessage extends Message {
    state?: string;
    value?: number;
    unit?: string;
}

export default abstract class SensorStateListener
    extends BatteryStateListener
    implements MqttConsumer<EventMessage>
{
    protected _sensor: Sensor;

    private _batteryListener: MqttConsumer<BatteryMessage> | undefined;
    private _configListener: ConfigChangeListener | undefined;

    constructor(
        private readonly configRetriever: ConfigRetrieverService,
        private readonly mqttService: MqttService,
        sensor: ISensor,
    ) {
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

        this._batteryListener = undefined;
        this._configListener = undefined;
    }

    public get sensor() {
        return this._sensor;
    }

    protected set sensor(newSensor: Sensor) {
        this._sensor = newSensor;
    }

    public async $onInit() {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        await this.mqttService.subscribe("event", this._sensor.entity!, this._sensor.action!, this);

        this._batteryListener = {
            message: (_: string, __: string, ___: string, message: BatteryMessage) =>
                this.batteryMessage(this.sensor.entity!, message),
        };
        await this.mqttService.subscribe(
            "event",
            this._sensor.entity!,
            "battery",
            this._batteryListener,
        );

        this._configListener = {
            onConfigChange: (type: ConfigFileType) => {
                if (type === ConfigFileType.Devices) {
                    this.onConfigChange(type);
                }
            },
        };
        this.configRetriever.addListener(ConfigFileType.Devices, this._configListener);
    }

    public async onDeInit() {
        await this.mqttService.unsubscribe(
            "event",
            this._sensor.entity!,
            this._sensor.action!,
            this,
        );

        if (this._batteryListener) {
            await this.mqttService.unsubscribe(
                "event",
                this._sensor.entity!,
                "battery",
                this._batteryListener,
            );

            this._batteryListener = undefined;
        }

        if (this._configListener) {
            this.configRetriever.removeListener(ConfigFileType.Devices, this._configListener);

            this._configListener = undefined;
        }
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
                message.timestamp,
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
        timestamp?: number,
    ): void;

    protected abstract onSensorDataMessage(
        sensorName: string,
        value: number,
        unit: string,
        timestamp?: number,
    ): void;

    protected abstract onSensorBatteryMessage(
        sensorName: string,
        value: number,
        timestamp?: number,
        charging?: boolean,
    ): void;

    protected abstract onConfigChange(type: ConfigFileType): void;
}
