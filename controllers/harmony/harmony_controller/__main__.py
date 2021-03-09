import sys

from dependency_injector.wiring import inject, Provide

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from harmony_controller.__version import __version__
from harmony_controller.container import ApplicationContainer


@inject
def main(
    logger: Logger = Provide[ApplicationContainer.common.logger],
    mqtt_client: MQTTClient = Provide[ApplicationContainer.common.mqtt_client],
    hub=Provide[ApplicationContainer.device.harmony_hub_device]
):
    logger.info('PowerPi Harmony Controller v{}'.format(__version__))

    # use MQTT loop to handle messages
    mqtt_client.loop()


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])

    main()
