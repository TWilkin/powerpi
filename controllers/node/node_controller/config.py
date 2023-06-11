import os

from powerpi_common.config import ControllerConfig
from powerpi_common.config.config import as_int


class NodeConfig(ControllerConfig):
    @property
    def device_fatal(self):
        value = os.getenv('DEVICE_FATAL')
        return value.lower() == 'true' if value is not None else False

    @property
    def i2c_device(self):
        value = os.getenv('I2C_DEVICE')
        return value.strip() if value is not None else '/dev/i2c-1'

    @property
    def i2c_address(self):
        value = as_int(os.getenv('I2C_ADDRESS'))
        return value if value is not None else 0x14

    @property
    def node_hostname(self):
        path = os.getenv('NODE_HOSTNAME', '/etc/nodehostname')

        if os.path.exists(path):
            with open(path, 'r', encoding='utf8') as file:
                return file.readline().strip().lower()

        return path.strip().lower()
