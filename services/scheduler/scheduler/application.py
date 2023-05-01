from apscheduler.schedulers.asyncio import AsyncIOScheduler
from powerpi_common.application import Application as CommonApplication
from powerpi_common.config.config_retriever import ConfigRetriever
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from scheduler.__version__ import __app_name__, __version__


class Application(CommonApplication):
    # pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        config_retriever: ConfigRetriever,
        mqtt_client: MQTTClient,
        scheduler: AsyncIOScheduler,
        health: HealthService
    ):
        CommonApplication.__init__(
            self, logger, config_retriever, mqtt_client,
            scheduler, health,
            __app_name__, __version__
        )

    async def _app_start(self):
        pass

    async def _app_stop(self):
        pass
