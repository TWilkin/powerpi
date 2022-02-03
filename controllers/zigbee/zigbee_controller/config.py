import os

from powerpi_common.config import Config as CommonConfig

class ZigbeeConfig(CommonConfig):
    @property
    def zigbee_serial(self):
        value = os.getenv('ZIGBEE_SERIAL')
        return value if value is not None else '/dev/ttyACM0'