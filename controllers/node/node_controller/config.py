import os

from powerpi_common.config import Config as CommonConfig


class NodeConfig(CommonConfig):
    @property
    def device_fatal(self):
        value = os.getenv('DEVICE_FATAL')
        return value.lower() == 'true' if value is not None else False

    @property
    def local_hostname(self):
        path = os.getenv('NODE_HOSTNAME')

        if path is None:
            path = '/etc/nodehostname'

        if os.path.exists(path):
            with open(path, 'r', encoding='utf8') as file:
                return file.readline().lower()

        return path.lower()
