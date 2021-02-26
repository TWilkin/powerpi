import logging

from common.config import Config
from device import SocketDevice, SocketGroupDevice

def main():
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-d %H:%M:%S'))

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)

    logger.info('PowerPi Energenie Controller')
    
    config = Config.instance()
    logger.info('Using Energenie module {module}'.format(module=config.energenie_device))
    devices = load_devices(config, logger)


def load_devices(config, logger):
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
