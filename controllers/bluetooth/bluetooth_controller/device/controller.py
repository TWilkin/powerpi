from bleak import BleakScanner


class BluetoothController:
    '''
    Wrapper around Bleak to hide implementation details from the devices/sensors.
    '''

    async def get_device(self, mac: str):
        return await BleakScanner.find_device_by_address(mac)
