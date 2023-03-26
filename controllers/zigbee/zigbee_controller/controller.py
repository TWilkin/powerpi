from apscheduler.schedulers.asyncio import AsyncIOScheduler
from powerpi_common.config.config_retriever import ConfigRetriever
from powerpi_common.controller import Controller as CommonController
from powerpi_common.device import DeviceManager, DeviceStatusChecker
from powerpi_common.event import EventManager
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from zigbee_controller.__version__ import __app_name__, __version__
from zigbee_controller.config import ZigbeeConfig
from zigbee_controller.device import ZigbeeController


class Controller(CommonController):
    # pylint: disable=too-many-arguments
    def __init__(
        self,
        config: ZigbeeConfig,
        logger: Logger,
        config_retriever: ConfigRetriever,
        device_manager: DeviceManager,
        event_manager: EventManager,
        mqtt_client: MQTTClient,
        device_status_checker: DeviceStatusChecker,
        scheduler: AsyncIOScheduler,
        health: HealthService,
        zigbee_controller: ZigbeeController
    ):
        CommonController.__init__(
            self, logger, config_retriever, device_manager,
            event_manager, mqtt_client, device_status_checker,
            scheduler, health,
            __app_name__, __version__
        )

        self.__config = config
        self.__zigbee_controller = zigbee_controller

    def _log_start(self):
        self._logger.info(
            f'Using ZigBee device at {self.__config.zigbee_device}'
        )

    async def _initialise_devices(self):
        await self.__zigbee_controller.startup()

    async def _cleanup_devices(self):
        await self.__zigbee_controller.shutdown()
