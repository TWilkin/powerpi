from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager
from powerpi_common.mqtt import DeviceStateEventConsumer, MQTTClient


class EventManager(object):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager
    ):
        self.__config = config
        self.__logger = logger
        self.__device_manager = device_manager

        self.__consumers = []

    def load(self):
        events = self.__config.events['events']

        # iterate over the configuration events and create listeners
        for event in events:
            # see if we can find the device
            try:
                device = self.__device_manager.get_device(
                    event['action']['device']
                )
            except:
                # not a problem, we didn't know if this is the correct controller
                continue

            topic = '{}/event/{}'.format(
                self.__config.topic_base,
                event['topic']
            )

            self.__consumers.append(EventConsumer(
                self.__config, self.__logger, topic, device
            ))

            self.__logger.info(
                f'Found event on topic "{topic}" for device {device}'
            )

        self.__logger.info(
            f'Found {len(self.__consumers)} matching events'
        )


class EventConsumer(DeviceStateEventConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        topic: str,
        device: Device
    ):
        DeviceStateEventConsumer.__init__(self, topic, device, config, logger)

    def on_message(self, client, user_data, message, entity, action):
        pass
