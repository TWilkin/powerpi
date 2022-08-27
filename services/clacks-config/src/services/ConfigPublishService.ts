import { ConfigFileType, LoggerService, MqttService } from "@powerpi/common";
import { Service } from "typedi";
import Container from "../container";

@Service()
export default class ConfigPublishService {
    private mqtt: MqttService;
    private logger: LoggerService;

    private static readonly topicType = "config";
    private static readonly topicAction = "change";
    private static readonly topicErrorAction = "error";

    constructor() {
        this.mqtt = Container.get(MqttService);
        this.logger = Container.get(LoggerService);
    }

    public publishConfigChange(fileType: ConfigFileType | string, file: object, checksum: string) {
        const message = {
            payload: file,
            checksum,
        };

        this.mqtt.publish(
            ConfigPublishService.topicType,
            fileType,
            ConfigPublishService.topicAction,
            message
        );

        this.logger.info("Published updated", fileType, "config");
    }

    public publishConfigError(fileType: ConfigFileType, text: string, errors: string | undefined) {
        const message = {
            message: text,
            errors,
        };

        this.mqtt.publish(
            ConfigPublishService.topicType,
            fileType,
            ConfigPublishService.topicErrorAction,
            message
        );
    }
}
