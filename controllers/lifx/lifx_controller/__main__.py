import sys

from dependency_injector.wiring import inject, Provide

from powerpi_common.logger import Logger
from powerpi_common.device import DeviceManager, DeviceStatusChecker
from powerpi_common.event import EventManager
from powerpi_common.mqtt import MQTTClient
from lifx_controller.__version import __version__
from lifx_controller.container import ApplicationContainer
from lifx_controller.device.container import add_devices


@inject
def main(
    logger: Logger = Provide[ApplicationContainer.common.logger],
    device_manager: DeviceManager = Provide[ApplicationContainer.common.device.device_manager],
    event_manager: EventManager = Provide[ApplicationContainer.common.event_manager],
    mqtt_client: MQTTClient = Provide[ApplicationContainer.common.mqtt_client],
    device_status_checker: DeviceStatusChecker = Provide[
        ApplicationContainer.common.device.device_status_checker
    ]
):
    logger.info('PowerPi LIFX Controller v{}'.format(__version__))

    # load the devices from the config
    device_manager.load()

    # load the events from the config
    event_manager.load()

    # start the thread to periodically check device status
    device_status_checker.start()

    # use MQTT loop to handle messages
    mqtt_client.loop()


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)

    main()
