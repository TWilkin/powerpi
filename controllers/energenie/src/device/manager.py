from common.config import Config
from common.logger import Logger


class DeviceManager(object):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        service_provider,
    ):
        self.__config = config
        self.__logger = logger
        self.__service_provider = service_provider
        self.__devices = {}

    @property
    def devices(self):
        return self.__devices

    def get_device(self, name):
        if self.__devices[name]:
            return self.__devices[name]

        raise Exception('Cannot find device "{name}"'.format(name=name))

    def load(self):
        devices = list(
            filter(
                lambda device: 'socket' in device['type'],
                self.__config.devices['devices']
            )
        )
        self.__logger.info(
            'Found {matches} matching devices'.format(matches=len(devices))
        )

        self.__devices = {}
        for device in devices:
            self.__logger.info('Found {type} "{name}"'.format(
                name=device['name'], type=device['type']))

            device_type = device['type']
            del device['type']

            if device_type == 'socket':
                instance = self.__service_provider.socket_factory(**device)
            elif device_type == 'socket_group':
                instance = self.__service_provider.socket_group_factory(
                    **device)
            else:
                continue

            self.__devices[device['name']] = instance
