import os

from powerpi_common.config import ControllerConfig


class ZigbeeConfig(ControllerConfig):
    @property
    def database_path(self):
        value = os.getenv('DATABASE_PATH')
        return value if value is not None else '/var/data/zigbee.db'

    @property
    def zigbee_device(self):
        value = os.getenv('ZIGBEE_DEVICE')
        return value if value is not None else '/dev/ttyACM0'

    @property
    def baudrate(self):
        value = os.getenv('ZIGBEE_BAUDRATE')
        return int(value) if value is not None else 115_200

    @property
    def flow_control(self):
        value = os.getenv('ZIGBEE_FLOW_CONTROL')
        return value.lower() if value is not None else 'software'
