from apscheduler.schedulers.asyncio import AsyncIOScheduler
from powerpi_common.application import Application as CommonApplication
from powerpi_common.config.config_retriever import ConfigRetriever
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from event.__version__ import __app_name__, __version__
from event.services import EventManager


class Application(CommonApplication):
    # pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        config_retriever: ConfigRetriever,
        mqtt_client: MQTTClient,
        scheduler: AsyncIOScheduler,
        health: HealthService,
        event_manager: EventManager
    ):
        CommonApplication.__init__(
            self, logger, config_retriever, mqtt_client,
            scheduler, health,
            __app_name__, __version__
        )

        self.__event_manager = event_manager

    async def _app_start(self):
        self.__event_manager.load()

    async def _app_stop(self):
        '''This service doesn't need to perform any tidy-up'''
