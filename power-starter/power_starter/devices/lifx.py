from lifxlan import Light, WorkflowException

from . devices import Device, DeviceManager
from power_starter.util.logger import Logger


@Device(device_type='light')
class LightDevice(Light):

    def __init__(self, mac, ip):
        Light.__init__(self, mac, ip)
    
    def poll(self):
        try:
            status = self.get_power()

            if status == 0:
                return 'off'
            return 'on'
        except WorkflowException as ex:
            Logger.error(ex)
        
        return 'unknown'
    
    def turn_on(self):
        self.__set_power(True)
    
    def turn_off(self):
        self.__set_power(False)
    
    def __set_power(self, on):
        try:
            self.set_power(on, 500)
        except WorkflowException as ex:
            Logger.error(ex)
