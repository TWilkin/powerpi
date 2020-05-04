from lifxlan import Light

from . devices import Device, DeviceManager


@Device(device_type='light')
class LightDevice(Light):

    def __init__(self, mac, ip):
        Light.__init__(self, mac, ip)
    
    def turn_on(self):
        self.set_power(True, 500)
    
    def turn_off(self):
        self.set_power(False, 500)
