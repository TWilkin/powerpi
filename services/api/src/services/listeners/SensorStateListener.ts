import { ConfigFileType, ConfigRetrieverService, Message, MqttConsumer } from "@powerpi/common";
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
    constructor(
        private readonly configRetriever: ConfigRetrieverService,
        private readonly mqttService: MqttService,
    ) {
        super();
    }

    public async $onInit() {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        await this.mqttService.subscribe("event", "+", "+", this);

        await this.mqttService.subscribe("event", "+", "battery", {
            message: (_: string, entity: string, ___: string, message: BatteryMessage) =>
                this.batteryMessage(entity, message),
        });

        this.configRetriever.addListener(ConfigFileType.Devices, {
            onConfigChange: (type: ConfigFileType) => {
                if (type === ConfigFileType.Devices) {
                    this.onConfigChange();
                }
            },
        });
    }

    public message(_: string, entity: string, action: string, message: EventMessage) {
        if (message.state) {
            this.onSensorStateMessage(entity, action, message.state, message.timestamp);
        } else if (message.value !== undefined && message.unit) {
            this.onSensorDataMessage(
                entity,
                action,
                message.value,
                message.unit,
                message.timestamp,
            );
        }
    }

    protected onBatteryMessage = (
        entity: string,
        value: number,
        timestamp?: number,
        charging?: boolean,
    ) => this.onSensorBatteryMessage(entity, value, timestamp, charging);

    protected abstract onSensorStateMessage(
        entity: string,
        action: string,
        state: string,
        timestamp?: number,
    ): void;

    protected abstract onSensorDataMessage(
        entity: string,
        action: string,
        value: number,
        unit: string,
        timestamp?: number,
    ): void;

    protected abstract onSensorBatteryMessage(
        entity: string,
        value: number,
        timestamp?: number,
        charging?: boolean,
    ): void;

    protected abstract onConfigChange(): void;
}
