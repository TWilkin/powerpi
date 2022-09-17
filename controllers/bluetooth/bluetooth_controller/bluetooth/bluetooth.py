from bluetooth_controller.device import BluetoothController


class BluetoothMixin:
    '''
    Mixin to encapsulate Bluetooth capability for a device or sensor.
    '''

    def __init__(
        self,
        controller: BluetoothController,
        mac: str,
        **_
    ):
        self.__controller = controller
        self.__mac = mac

    async def _get_bluetooth_device(self):
        return await self.__controller.get_device(self.__mac)
