import logging

from common.config import Config

def main():
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-d %H:%M:%S'))

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)

    logger.info('PowerPi Energenie Controller')
    
    config = Config.instance()
    logger.info('Using Energenie module {module}'.format(module = config.energenie_device))

    devices = list(filter(lambda device : 'socket' in device['type'], config.devices['devices']))
    logger.info('Found {matches} matching devices'.format(matches = len(devices)))

if __name__ == '__main__':
    main()
