import sys

from dependency_injector.wiring import inject, Provide

from common.config import Config
from common.logger import Logger
from common.mqtt import MQTTClient
from container import ApplicationContainer
from device.container import add_sockets
from device.manager import DeviceManager


@inject
def main(
    config: Config = Provide[ApplicationContainer.common.config],
    logger: Logger = Provide[ApplicationContainer.common.logger],
    device_manager: DeviceManager = Provide[ApplicationContainer.device.device_manager],
    mqtt_client: MQTTClient = Provide[ApplicationContainer.common.mqtt_client]
):
    logger.info('PowerPi Energenie Controller')

    logger.info('Using Energenie module {module}'
                .format(module=config.energenie_device))

    # load the devices from the config
    device_manager.load()

    # use MQTT loop to handle messages
    mqtt_client.loop()


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])

    # dynamically add the socket based on the config
    add_sockets(container)

    main()
