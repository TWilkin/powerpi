from apscheduler.schedulers.asyncio import AsyncIOScheduler
from powerpi_common.controller import Controller as CommonController
from powerpi_common.device import DeviceManager, DeviceStatusChecker
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from network_controller.__version__ import __app_name__, __version__
from network_controller.services.arp import ARPFactory, ARPReader


class Controller(CommonController):
    # pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        device_manager: DeviceManager,
        mqtt_client: MQTTClient,
        device_status_checker: DeviceStatusChecker,
        scheduler: AsyncIOScheduler,
        health: HealthService,
        arp_factory: ARPFactory
    ):
        CommonController.__init__(
            self, logger, device_manager,
            mqtt_client, device_status_checker,
            scheduler, health,
            __app_name__, __version__
        )

        self.__arp_factory = arp_factory
        self.__arp_service: ARPReader | None

    async def _app_start(self):
        await CommonController._app_start(self)

        self.__arp_service = self.__arp_factory.get_arp_service()
        if self.__arp_service is not None:
            await self.__arp_service.start()

    async def _app_stop(self):
        if self.__arp_service is not None:
            await self.__arp_service.stop()

        await CommonController._app_stop(self)
