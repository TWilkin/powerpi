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
        # read the battery level
        device = self.battery_device

        if device.data.battery is not None:
            self.on_battery_change(device.data.battery)

        # read the heating state
        device = await self.heating_device()
        if device.status is not None:
            temperature_unit = device.temperature_unit \
                if device.temperature_unit is not None else '°C'
            temperature_unit = '°C' \
                if temperature_unit == 'C' else temperature_unit

            # broadcast the current temperature
            message = {
                'temperature': device.status.current_temperature,
                'unit': temperature_unit
            }
            self._broadcast('temperature', message)

            # broadcast the heating target temperature
            message = {
                'temperature': device.status.target_temperature,
                'unit': temperature_unit
            }
            self._broadcast('target', message)
