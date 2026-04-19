from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dependency_injector import containers
from powerpi_common.controller import Controller as CommonController
from powerpi_common.device import DeviceManager, DeviceStatusChecker
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from network_controller.__version__ import __app_name__, __version__
from network_controller.services.arp import ARPProviderFactory, ARPProvider


class Controller(CommonController):
    # pylint: disable=too-many-arguments,too-many-positional-arguments
    def __init__(
        self,
        logger: Logger,
        device_manager: DeviceManager,
        mqtt_client: MQTTClient,
        device_status_checker: DeviceStatusChecker,
        scheduler: AsyncIOScheduler,
        health: HealthService,
        container: containers.DeclarativeContainer,
        arp_provider_factory: ARPProviderFactory
    ):
        CommonController.__init__(
            self,
            logger,
            device_manager,
            mqtt_client,
            device_status_checker,
            scheduler,
            health,
            container,
            __app_name__,
            __version__
        )

        self.__arp_provider_factory = arp_provider_factory
        self.__arp_provider: ARPProvider | None

    async def _app_start(self):
        await CommonController._app_start(self)

        self.__arp_provider = self.__arp_provider_factory.get_arp_service()
        if self.__arp_provider is not None:
            await self.__arp_provider.start()

    async def _app_stop(self):
        if self.__arp_provider is not None:
            await self.__arp_provider.stop()

        await CommonController._app_stop(self)
