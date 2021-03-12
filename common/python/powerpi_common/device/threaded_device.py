from threading import Lock, Thread

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from .device import Device


class ThreadedDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self._lock = Lock()

    def on_message(self, client, user_data, message, entity, action):
        def handler():
            Device.on_message(self, client, user_data, message, entity, action)

        Thread(target=handler).start()
