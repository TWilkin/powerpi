import asyncio
import sys

from dependency_injector.wiring import inject, Provide

from powerpi_common.config import ConfigRetriever
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from zigbee_controller.__version import __version__
from zigbee_controller.config import ZigbeeConfig
from zigbee_controller.container import ApplicationContainer


@inject
async def main(
    config: ZigbeeConfig = Provide[ApplicationContainer.config],
    logger: Logger = Provide[ApplicationContainer.common.logger],
    config_retriever: ConfigRetriever = Provide[ApplicationContainer.common.config_retriever],
    mqtt_client: MQTTClient = Provide[ApplicationContainer.common.mqtt_client],
):
    logger.info(f'PowerPi Zigbee Controller v{__version__}')

    logger.info(f'Using Zigbee device at {config.zigbee_device}')

    # intially connect to MQTT
    mqtt_client.connect()

    # retrieve any config from the queue
    await config_retriever.start()

    # use MQTT loop to handle messages
    mqtt_client.loop()


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])

    coro = main()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(coro)
