class EnergenieInterface(object):
    @property
    def home_id(self):
        return self._home_id

    @home_id.setter
    def home_id(self, new_home_id: int):
        self._home_id = new_home_id

    @property
    def device_id(self):
        return self._device_id

    @device_id.setter
    def device_id(self, new_device_id: int):
        self._device_id = new_device_id

    def turn_on(self):
        pass

    def turn_off(self):
        pass
