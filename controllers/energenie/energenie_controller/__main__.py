import sys

from dependency_injector.wiring import inject, Provide

from powerpi_common.device import DeviceManager
from powerpi_common.event import EventManager
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from energenie_controller.__version import __version__
from energenie_controller.config import EnergenieConfig
from energenie_controller.container import ApplicationContainer
from energenie_controller.device.container import add_devices


@inject
def main(
    config: EnergenieConfig = Provide[ApplicationContainer.config],
    logger: Logger = Provide[ApplicationContainer.common.logger],
    device_manager: DeviceManager = Provide[ApplicationContainer.common.device.device_manager],
    event_manager: EventManager = Provide[ApplicationContainer.common.event_manager],
    mqtt_client: MQTTClient = Provide[ApplicationContainer.common.mqtt_client]
):
    logger.info('PowerPi Energenie Controller v{}'.format(__version__))

    logger.info('Using Energenie module {module}'
                .format(module=config.energenie_device))

    # load the devices from the config
    device_manager.load()

    # load the events from the config
    event_manager.load()

    # use MQTT loop to handle messages
    mqtt_client.loop()


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)

    main()
