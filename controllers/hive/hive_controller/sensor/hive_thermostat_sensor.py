from hive_controller.device import HiveDeviceMixin
from powerpi_common.device.mixin import NewPollableMixin
from powerpi_common.sensor import Sensor
from powerpi_common.sensor.mixin.battery import BatteryMixin


class HiveThermostatSensor(Sensor, BatteryMixin, NewPollableMixin, HiveDeviceMixin):
    '''
    Add support for a Hive thermostat's sensors.
    '''

    def __init__(
        self,
        **kwargs
    ):
        Sensor.__init__(self, **kwargs)
        BatteryMixin.__init__(self)
        NewPollableMixin.__init__(self, **kwargs)
        HiveDeviceMixin.__init__(self, **kwargs)

    @property
    def executing(self):
        return False

    async def _poll(self):
        device = self.get_hive_device('Battery')

        if device.data.battery is not None:
            self.on_battery_change(device.data.battery)
