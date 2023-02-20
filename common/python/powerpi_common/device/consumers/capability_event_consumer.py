from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTConsumer
from powerpi_common.typing import DeviceType


class CapabilityEventConsumer(MQTTConsumer):
    def __init__(
        self,
        device: DeviceType,
        config: Config,
        logger: Logger
    ):
        topic = f'device/{device.name}/capability'

        MQTTConsumer.__init__(
            self, topic, config, logger
        )
