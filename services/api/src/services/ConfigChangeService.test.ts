import { type Message, MqttConsumer, MqttService } from "@powerpi/common";
import { capture, instance, mock, resetCalls, verify } from "ts-mockito";
import ApiSocketService from "./ApiSocketService.js";
import ConfigChangeService from "./ConfigChangeService.js";
import { type ChangeMessage } from "./listeners/ConfigChangeListener.js";

const mockedMqttService = mock<MqttService>();
const mockedApiSocketService = mock<ApiSocketService>();

function getConsumer<TConsumer extends Message>(action: string) {
    const subscriptions = capture(mockedMqttService.subscribe);

    for (let i = 0; ; i++) {
        const subscription = subscriptions.byCallIndex(i);
        if (!subscription) {
            break;
        }

        if (subscription[2] === action) {
            return subscription[3] as MqttConsumer<TConsumer>;
        }
    }

    return undefined;
}

describe("ConfigChangeService", () => {
    let subject: ConfigChangeService | undefined;

    beforeEach(() => {
        resetCalls(mockedMqttService);
        resetCalls(mockedApiSocketService);

        subject = new ConfigChangeService(
            instance(mockedMqttService),
            instance(mockedApiSocketService),
        );

        subject?.$onInit();
    });

    test("onConfigChange", () => {
        const entity = "HallwaySensor";

        const consumer = getConsumer<ChangeMessage>("change");

        consumer?.message("config", entity, "change", {
            payload: {
                data: "some data",
            },
            checksum: "1234",
            timestamp: 12345,
        });

        verify(mockedApiSocketService.onConfigChange(entity)).once();
    });
});
