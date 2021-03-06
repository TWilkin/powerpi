import sys

from dependency_injector.wiring import inject, Provide

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from energenie_controller.__version import __version__
from energenie_controller.container import ApplicationContainer
from energenie_controller.device.container import add_sockets
from energenie_controller.device.manager import DeviceManager


@inject
def main(
    config: Config = Provide[ApplicationContainer.common.config],
    logger: Logger = Provide[ApplicationContainer.common.logger],
    device_manager: DeviceManager = Provide[ApplicationContainer.device.device_manager],
    mqtt_client: MQTTClient = Provide[ApplicationContainer.common.mqtt_client]
):
    logger.info('PowerPi Energenie Controller v{}'.format(__version__))

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
    add_sockets(container.device())

    main()
