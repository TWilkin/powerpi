from apscheduler.schedulers.asyncio import AsyncIOScheduler
from powerpi_common.application import Application as CommonApplication
from powerpi_common.config.config_retriever import ConfigRetriever
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.startup import StartUpService
from scheduler.__version__ import __app_name__, __version__
from scheduler.services import DeviceScheduler


class Application(CommonApplication):
    # pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        config_retriever: ConfigRetriever,
        mqtt_client: MQTTClient,
        scheduler: AsyncIOScheduler,
        health: HealthService,
        startup: StartUpService,
        device_scheduler: DeviceScheduler
    ):
        CommonApplication.__init__(
            self, logger, config_retriever, mqtt_client,
            scheduler, health, startup,
            __app_name__, __version__
        )

        self.__device_scheduler = device_scheduler

    async def _app_start(self):
        self.__device_scheduler.start()

    async def _app_stop(self):
        pass
