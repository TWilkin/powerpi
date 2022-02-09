import os

from powerpi_common.config import Config as CommonConfig

class ZigbeeConfig(CommonConfig):
    @property
    def database_path(self):
        value = os.getenv('DATABASE_PATH')
        return value if value is not None else './zigbee.db'
    
    @property
    def zigbee_device(self):
        value = os.getenv('ZIGBEE_DEVICE')
        return value if value is not None else '/dev/ttyACM0'
