import sys

from dependency_injector.wiring import inject, Provide

from common.config import Config
from common.logger import Logger
from device.container import Container, add_sockets
from device.manager import DeviceManager


@inject
def main(
    config: Config = Provide[Container.config],
    logger: Logger = Provide[Container.logger],
    device_manager: DeviceManager = Provide[Container.device_manager]
):
    logger.info('PowerPi Energenie Controller')

    logger.info('Using Energenie module {module}'
                .format(module=config.energenie_device))

    device_manager.devices = load_devices()
    for key in device_manager.devices:
        device_manager.devices[key].turn_on()


@inject
def load_devices(
    service_provider: Container = Provide[Container.service_provider],
    config: Config = Provide[Container.config],
    logger: Logger = Provide[Container.logger]
):
    devices = list(
        filter(lambda device: 'socket' in device['type'], config.devices['devices']))
    logger.info('Found {matches} matching devices'.format(
        matches=len(devices)))

    devices_impl = {}
    for device in devices:
        logger.info('Found {type} "{name}"'.format(
            name=device['name'], type=device['type']))

        device_type = device['type']
        del device['type']

        if device_type == 'socket':
            instance = service_provider.socket_factory(**device)
        elif device_type == 'socket_group':
            instance = service_provider.socket_group_factory(**device)
        else:
            continue

        devices_impl[device['name']] = instance

    return devices_impl


if __name__ == '__main__':
    # initialise DI
    container = Container()
    container.wire(modules=[sys.modules[__name__]])

    # dynamically add the socket based on the config
    add_sockets(container)

    main()
