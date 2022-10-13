import os

from powerpi_common.config import Config as CommonConfig


class NodeConfig(CommonConfig):
    @property
    def device_fatal(self):
        value = os.getenv('DEVICE_FATAL')
        return value.lower() == 'true' if value is not None else False

    @property
    def pijuice(self):
        value = os.getenv('PIJUICE')
        return value.lower() == 'true' if value is not None else False
