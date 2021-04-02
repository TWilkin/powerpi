from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import DeviceManager
from powerpi_common.mqtt import MQTTClient


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

    def load(self):
        events = self.__config.events['events']
        self.__logger.info(events)
