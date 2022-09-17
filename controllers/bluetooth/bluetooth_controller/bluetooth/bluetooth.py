from bleak import BleakScanner


class BluetoothMixin:
    '''
    Mixin to encapsulate Bluetooth capability for a device or sensor.
    '''

    def __init__(
        self,
        mac: str,
        **_
    ):
        self.__mac = mac

    async def _get_bluetooth_device(self):
        return await BleakScanner.find_device_by_address(self.__mac)
