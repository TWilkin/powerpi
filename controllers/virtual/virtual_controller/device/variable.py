from powerpi_common.device import Device


class VariableDevice(Device):
    def __init__(self, **kwargs):
        Device.__init__(self,  **kwargs)

    async def _turn_on(self):
        # doesn't have to do anything special, just broadcast the status change
        pass

    async def _turn_off(self):
        # doesn't have to do anything special, just broadcast the status change
        pass
