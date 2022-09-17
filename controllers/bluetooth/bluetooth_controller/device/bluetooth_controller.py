from bleak import BleakScanner
from powerpi_common.logger import Logger


class BluetoothController:
    def __init__(self, logger: Logger):
        self.__logger = logger

        self.__scanner = BleakScanner()

    async def discover(self):
        self.__logger.info('Starting Bluetooth scan')

        devices = await self.__scanner.discover()

        self.__logger.info('Found', len(devices), 'device(s)')
