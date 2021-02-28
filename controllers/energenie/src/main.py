import sys

from dependency_injector.wiring import inject, Provide

from common.config import Config
from common.container import Container
from device import import_energenie
from device.manager import DeviceManager


@inject
def main(
    config: Config = Provide[Container.config]
):
    logger = config.logger()

    logger.info('PowerPi Energenie Controller')

    logger.info('Using Energenie module {module}'
                .format(module=config.energenie_device))

    DeviceManager.instance().devices = load_devices()
    for key in DeviceManager.instance().devices:
        DeviceManager.instance().devices[key].turn_on()


@inject
def load_devices(
    config: Config = Provide[Container.config]
):
    import_energenie()
    logger = config.logger()

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

        # if device_type == 'socket':
        #     instance = SocketDevice(**device)
        # elif device_type == 'socket_group':
        #     instance = SocketGroupDevice(**device)
        # else:
        #     continue

        # devices_impl[device['name']] = instance

    return devices_impl


if __name__ == '__main__':
    container = Container()
    container.wire(modules=[sys.modules[__name__]])
    main()
