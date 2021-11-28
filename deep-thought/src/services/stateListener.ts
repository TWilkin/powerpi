import { DeviceState } from "../models/device";
import ConfigService from "./config";
import MqttService, { MqttListener } from "./mqtt";

export default abstract class StateListener implements MqttListener {
    private topicMatcherRegex: RegExp;

    constructor(
        protected readonly config: ConfigService,
        private readonly mqttService: MqttService
    ) {
        this.topicMatcherRegex = new RegExp(this.topicName(".*")).compile();
    }

    private topicName = (placeholder: string) =>
        `${this.config.topicNameBase}/device/${placeholder}/status`;

    public get topicMatcher() {
        return this.topicMatcherRegex;
    }

    public async $onInit() {
        this.mqttService.subscribe(this.topicName("+"), this);
    }

    public async onMessage(topic: string, message: any) {
        const [, , deviceName] = topic.split("/", 4);

        this.onStateMessage(deviceName, message.state, message.timestamp);
    }

    protected abstract onStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp: number
    ): void;
}
