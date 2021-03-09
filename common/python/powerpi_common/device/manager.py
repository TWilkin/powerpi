from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .factory import DeviceFactory


class DeviceManager(object):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        factory: DeviceFactory
    ):
        self.__config = config
        self.__logger = logger
        self.__factory = factory

        self.__devices = {}

    @property
    def devices(self):
        return self.__devices

    def get_device(self, name):
        if self.__devices[name]:
            return self.__devices[name]

        raise Exception('Cannot find device "{name}"'.format(name=name))

    def load(self):
        devices = self.__config.devices['devices']

        self.__devices = {}
        for device in devices:
            device_type = device['type']
            del device['type']

            instance = self.__factory.build(device_type, **device)
            if instance is not None:
                self.__logger.info('Found {}'.format(instance))

                self.__devices[device['name']] = instance

        self.__logger.info(
            'Found {} matching devices'.format(len(self.__devices))
        )
