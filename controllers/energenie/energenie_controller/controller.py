from apscheduler.schedulers.asyncio import AsyncIOScheduler
from powerpi_common.config.config_retriever import ConfigRetriever
from powerpi_common.controller import Controller as CommonController
from powerpi_common.device import DeviceManager, DeviceStatusChecker
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from energenie_controller.__version__ import __app_name__, __version__
from energenie_controller.config import EnergenieConfig


class Controller(CommonController):
    # pylint: disable=too-many-arguments
    def __init__(
        self,
        config: EnergenieConfig,
        logger: Logger,
        config_retriever: ConfigRetriever,
        device_manager: DeviceManager,
        mqtt_client: MQTTClient,
        device_status_checker: DeviceStatusChecker,
        scheduler: AsyncIOScheduler,
        health: HealthService
    ):
        CommonController.__init__(
            self, logger, config_retriever, device_manager,
            mqtt_client, device_status_checker,
            scheduler, health,
            __app_name__, __version__
        )

        self.__config = config

    def _log_start(self):
        self._logger.info(
            f'Using Energenie module {self.__config.energenie_device}'
        )
