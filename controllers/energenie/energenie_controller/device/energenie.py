class EnergenieInterface(object):

    def set_ids(self, home_id: int, device_id: int):
        self._home_id = home_id
        self._device_id = device_id

    def turn_on(self):
        pass

    def turn_off(self):
        pass
