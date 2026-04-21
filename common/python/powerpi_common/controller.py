from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dependency_injector import containers

from powerpi_common.application import Application
from powerpi_common.device import (
    DeviceManager,
    DeviceStatusChecker,
    bind_common_device_dependencies,
    bind_common_sensor_dependencies
)
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


# pylint: disable=too-many-instance-attributes
class Controller(Application):
    # pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        device_manager: DeviceManager,
        mqtt_client: MQTTClient,
        device_status_checker: DeviceStatusChecker,
        scheduler: AsyncIOScheduler,
        health: HealthService,
        container: containers.DeclarativeContainer,
        app_name: str,
        version: str
    ):
        Application.__init__(
            self, logger, mqtt_client,
            scheduler, health, app_name, version
        )

        self.__container = container
        self.__device_manager = device_manager
        self.__device_status_checker = device_status_checker

    def _register(self):
        bind_common_device_dependencies(self.__container)
        bind_common_sensor_dependencies(self.__container)

    async def _initialise_devices(self):
        pass

    async def _cleanup_devices(self):
        pass

    async def _app_start(self):
        # perform any device initialisation
        await self._initialise_devices()

        # load the devices from the config
        await self.__device_manager.load()

        # periodically check device status
        self.__device_status_checker.start()

    async def _app_stop(self):
        await self.__device_manager.deinitialise()

        await self._cleanup_devices()
