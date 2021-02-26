from common.config import Config
from device import SocketDevice, SocketGroupDevice

config = Config.instance()
logger = config.logger()


def main():
    logger.info('PowerPi Energenie Controller')
    
    logger.info('Using Energenie module {module}'.format(module=config.energenie_device))
    devices = load_devices()

    for key in devices:
        devices[key].turn_on()


def load_devices():
    devices = list(filter(lambda device : 'socket' in device['type'], config.devices['devices']))
    logger.info('Found {matches} matching devices'.format(matches=len(devices)))

    devices_impl = {}
    for device in devices:
        logger.info('Found {type} "{name}"'.format(name=device['name'], type=device['type']))

        device_type = device['type']
        del device['type']

        if device_type == 'socket':
            instance = SocketDevice(**device)
        elif device_type == 'socket_group':
            instance = SocketGroupDevice(**device)
        else:
            continue
        
        devices_impl[device['name']] = instance
    
    return devices_impl


if __name__ == '__main__':
    main()
