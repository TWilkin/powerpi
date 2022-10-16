import os

from powerpi_common.config import Config as CommonConfig


class NodeConfig(CommonConfig):
    @property
    def device_fatal(self):
        value = os.getenv('DEVICE_FATAL')
        return value.lower() == 'true' if value is not None else False

    @property
    def node_hostname(self):
        path = os.getenv('NODE_HOSTNAME', '/etc/nodehostname')

        if os.path.exists(path):
            with open(path, 'r', encoding='utf8') as file:
                return file.readline().strip().lower()

        return path.strip().lower()
