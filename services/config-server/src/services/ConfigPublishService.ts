import { ConfigFileType, LoggerService, MqttService } from "@powerpi/common";
import { Service } from "typedi";

@Service()
export default class ConfigPublishService {
    private static readonly topicType = "config";
    private static readonly topicAction = "change";
    private static readonly topicErrorAction = "error";

    constructor(
        private readonly mqtt: MqttService,
        private readonly logger: LoggerService,
    ) {}

    public async publishConfigChange(
        fileType: ConfigFileType | string,
        file: object,
        checksum: string,
    ) {
        const message = {
            payload: file,
            checksum,
        };

        await this.mqtt.publish(
            ConfigPublishService.topicType,
            fileType,
            ConfigPublishService.topicAction,
            message,
        );

        this.logger.info("Published updated", fileType, "config");
    }

    public async publishConfigError(
        fileType: ConfigFileType,
        text: string,
        errors: string | undefined,
    ) {
        const message = {
            message: text,
            errors,
        };

        await this.mqtt.publish(
            ConfigPublishService.topicType,
            fileType,
            ConfigPublishService.topicErrorAction,
            message,
        );
    }
}
