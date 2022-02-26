from powerpi_common.config import Config
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, MQTTMessage
from .device_event_consumer import DeviceEventConsumer


class DeviceInitialStatusEventConsumer(DeviceEventConsumer):
    def __init__(self, device, config: Config, logger: Logger, mqtt_client: MQTTClient):
        topic = f'device/{device.name}/status'

        DeviceEventConsumer.__init__(
            self, topic, device, config, logger
        )

        self.__active = True

        self.__mqtt_client = mqtt_client
        self.__mqtt_client.add_consumer(self)

    def on_message(self, message: MQTTMessage, entity: str, _: str):
        if self.__active and self._is_message_valid(entity, message.get('state')):
            new_power_state = message.pop('state', DeviceStatus.UNKNOWN)

            # don't broadcast as this is the device's initial state on startup
            self._device.update_state_no_broadcast(new_power_state)

            # remove this consumer as it has completed its job
            self.__active = False
            self.__mqtt_client.remove_consumer(self)
