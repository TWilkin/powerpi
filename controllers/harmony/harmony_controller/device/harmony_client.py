import pyharmony

from pyharmony.client import create_and_connect_client

from powerpi_common.logger import Logger


class HarmonyClient(object):

    def __init__(self, logger: Logger):
        self.__logger = logger
        self.__logger.add_logger(pyharmony.client.__name__)

    @property
    def address(self):
        return self.__address

    @address.setter
    def address(self, new_address: setattr):
        self.__address = new_address

    @property
    def port(self):
        return self.__port

    @port.setter
    def port(self, new_port: int):
        self.__port = new_port

    def __str__(self):
        return 'harmony://{}:{}'.format(self.__address, self.__port)

    def __enter__(self):
        self.__logger.info('Connecting to hub at "{}"'.format(self))
        self.__client = create_and_connect_client(self.__address, self.__port)

        if not self.__client:
            raise Exception(
                'Harmony hub at "{}" not found'.format(self)
            )

        return self.__client

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.__client:
            self.__client.disconnect()
