from asyncio import (CancelledError, ensure_future, get_event_loop,
                     get_running_loop)
from signal import SIGINT, SIGTERM

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from powerpi_common.config.config_retriever import ConfigRetriever
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger, LogMixin
from powerpi_common.mqtt import MQTTClient


class Application(LogMixin):
    '''
    Entrypoint for a PowerPi python service which configures all common behaviour.
    '''

    # pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        config_retriever: ConfigRetriever,
        mqtt_client: MQTTClient,
        scheduler: AsyncIOScheduler,
        health: HealthService,
        app_name: str,
        version: str
    ):
        self._logger = logger
        self.__config_retriever = config_retriever
        self.__mqtt_client = mqtt_client
        self.__scheduler = scheduler
        self.__health = health
        self.__app_name = app_name
        self.__version = version

    def start(self):
        loop = get_event_loop()
        main = ensure_future(self.__main())

        for signal in [SIGINT, SIGTERM]:
            loop.add_signal_handler(signal, main.cancel)

        try:
            loop.run_until_complete(main)
        finally:
            loop.close()

    def _log_start(self):
        pass

    async def _app_start(self):
        raise NotImplementedError('Application start should be implemented')

    async def _app_stop(self):
        raise NotImplementedError('Application stop should be implemented')

    async def __main(self):
        self.log_info(f'PowerPi {self.__app_name} v{self.__version}')
        self._log_start()

        try:
            # start the scheduler
            self.__scheduler.start()

            # intially connect to MQTT
            await self.__mqtt_client.connect()

            # retrieve any config from the queue
            await self.__config_retriever.start()

            # start any custom parts of this app
            await self._app_start()

            # start the health check
            self.__health.start()

            # loop forever
            await get_running_loop().create_future()
        except CancelledError:
            await self.__cleanup()

    async def __cleanup(self):
        self.__scheduler.shutdown()

        await self._app_stop()

        await self.__mqtt_client.disconnect()
