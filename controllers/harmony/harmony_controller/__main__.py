import asyncio
import sys

from dependency_injector.wiring import inject, Provide

from powerpi_common.config.config_retriever import ConfigRetriever
from powerpi_common.logger import Logger
from powerpi_common.device import DeviceManager, DeviceStatusChecker
from powerpi_common.event import EventManager
from powerpi_common.mqtt import MQTTClient
from harmony_controller.__version__ import __version__
from harmony_controller.container import ApplicationContainer
from harmony_controller.device.container import add_devices


@inject
async def main(
    logger: Logger = Provide[ApplicationContainer.common.logger],
    config_retriever: ConfigRetriever = Provide[ApplicationContainer.common.config_retriever],
    device_manager: DeviceManager = Provide[ApplicationContainer.common.device.device_manager],
    event_manager: EventManager = Provide[ApplicationContainer.common.event_manager],
    mqtt_client: MQTTClient = Provide[ApplicationContainer.common.mqtt_client],
    device_status_checker: DeviceStatusChecker = Provide[
        ApplicationContainer.common.device.device_status_checker
    ]
):
    logger.info(f'PowerPi Harmony Controller v{__version__}')

    # intially connect to MQTT
    await mqtt_client.connect()

    # retrieve any config from the queue
    await config_retriever.start()

    # load the devices from the config
    device_manager.load()

    # load the events from the config
    event_manager.load()

    # start the thread to periodically check device status
    device_status_checker.start()

    # loop
    await asyncio.get_running_loop().create_future()


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
