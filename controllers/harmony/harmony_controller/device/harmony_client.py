import atexit
import pyharmony
import time

from powerpi_common.logger import Logger


class HarmonyClient(object):

    def __init__(self, logger: Logger):
        self.__logger = logger
        self.__logger.add_logger(pyharmony.client.__name__)

        self.__client = None

        atexit.register(self.disconnect)

    @property
    def is_connected(self):
        return self.__client != None

    @ property
    def address(self):
        return self.__address

    @ address.setter
    def address(self, new_address: setattr):
        self.__address = new_address

    @ property
    def port(self):
        return self.__port

    @ port.setter
    def port(self, new_port: int):
        self.__port = new_port

    def get_config(self):
        def func():
            return self.__client.get_config()

        return self.__reconnect_and_run(func)

    def start_activity(self, activity_name: str):
        def func():
            self.__client.start_activity(activity_name)

        self.__reconnect_and_run(func)

    def power_off(self):
        def func():
            self.__client.power_off()

        self.__reconnect_and_run(func)

    def connect(self, reconnect=False):
        if reconnect or not self.is_connected:
            self.__logger.info('Connecting to hub at "{}"'.format(self))
            self.__client = pyharmony.client.create_and_connect_client(
                self.__address, self.__port
            )

            if self.__client == False:
                self.__client = None
                raise ConnectionError(
                    'Failed to connect to hub at "{}"'.format(self)
                )

    def disconnect(self):
        if self.is_connected:
            self.__logger.info('Disconnecting from hub at "{}"'.format(self))
            self.__client.disconnect()
            self.__client = None

    def __reconnect_and_run(self, func, retries=2):
        first = True

        for retry in range(0, retries):
            try:
                self.connect(not first)

                return func()
            except Exception as e:
                first = False

                if retry == retries - 1:
                    self.__logger.error(
                        'Failed to connect after retry {}, giving up.'.format(
                            retries
                        )
                    )
                    self.__logger.exception(e)
                    raise e

                # wait a little bit before retrying
                time.sleep(2)

    def __str__(self):
        return 'harmony://{}:{}'.format(self.__address, self.__port)
