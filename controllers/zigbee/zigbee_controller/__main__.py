import asyncio
import sys

from dependency_injector.wiring import inject, Provide

from powerpi_common.config import ConfigRetriever
from powerpi_common.device import DeviceManager, DeviceStatusChecker
from powerpi_common.event import EventManager
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from zigbee_controller.__version__ import __version__
from zigbee_controller.config import ZigbeeConfig
from zigbee_controller.container import ApplicationContainer
from zigbee_controller.device.container import add_devices
from zigbee_controller.device.zigbee_controller import ZigbeeController
from zigbee_controller.sensor import add_sensors


@inject
async def main(
    config: ZigbeeConfig = Provide[ApplicationContainer.config],
    logger: Logger = Provide[ApplicationContainer.common.logger],
    config_retriever: ConfigRetriever = Provide[ApplicationContainer.common.config_retriever],
    device_manager: DeviceManager = Provide[ApplicationContainer.common.device.device_manager],
    device_status_checker: DeviceStatusChecker = Provide[
        ApplicationContainer.common.device.device_status_checker
    ],
    event_manager: EventManager = Provide[ApplicationContainer.common.event_manager],
    mqtt_client: MQTTClient = Provide[ApplicationContainer.common.mqtt_client],
    zigbee_controller: ZigbeeController = Provide[ApplicationContainer.device.zigbee_controller]
):
    logger.info(f'PowerPi ZigBee Controller v{__version__}')

    logger.info(f'Using ZigBee device at {config.zigbee_device}')

    # intially connect to MQTT
    mqtt_client.connect()

    # retrieve any config from the queue
    await config_retriever.start()

    # initialise the Zigbee device
    await zigbee_controller.startup()

    # load the devices and sensors from the config
    device_manager.load()

    # load the events from the config
    event_manager.load()

    # start the thread to periodically check device status
    device_status_checker.start()

    # no need to join MQTT thread as we continue running for Zigbee
    await asyncio.get_running_loop().create_future()


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)
    add_sensors(container)

    coro = main()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(coro)
