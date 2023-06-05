import statistics
from asyncio import sleep
from typing import List, TypedDict, Union

from dependency_injector import providers
from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import InitialisableMixin, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor.mixin import BatteryMixin

from node_controller.pijuice import PiJuiceInterface
from node_controller.pwm_fan import PWMFanCurve, PWMFanInterface
from node_controller.services import ShutdownService

PiJuiceConfig = TypedDict(
    'PiJuiceConfig',
    {
        'charge_battery': bool,
        'max_charge': int,
        'shutdown_delay': int,
        'shutdown_level': int,
        'wake_up_on_charge': int
    },
    total=False
)

PWMFanConfig = TypedDict(
    'PWMFanConfig',
    {
        'curve': List[PWMFanCurve]
    },
    total=False
)


class LocalNodeDevice(Device, InitialisableMixin, PollableMixin, BatteryMixin):
    # pylint: disable=too-many-ancestors
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        pijuice_interface_factory: providers.Factory,
        pwm_fan_controller_factory: providers.Factory,
        shutdown: ShutdownService,
        pijuice: Union[PiJuiceConfig, None] = None,
        pwm_fan: Union[PWMFanConfig, None] = None,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)
        BatteryMixin.__init__(self)

        if pijuice is not None:
            self.__pijuice: PiJuiceInterface = pijuice_interface_factory()

            # set the config with defaults
            self.__pijuice_config = PiJuiceConfig({
                'charge_battery': True,
                'max_charge': 100,
                'shutdown_delay': 120,
                'shutdown_level': 20,
                'wake_up_on_charge': 25,
                **pijuice
            })
        else:
            self.__pijuice = None
            self.__pijuice_config = None

        if pwm_fan is not None:
            self.__pwm_fan: PWMFanInterface = pwm_fan_controller_factory(
                pijuice=self.__pijuice
            )

            # set the config with defaults
            self.__pwm_fan_config = PWMFanConfig({
                'curve': [
                    PWMFanCurve({'temperature': 30, 'speed': 25}),
                    PWMFanCurve({'temperature': 40, 'speed': 50}),
                    PWMFanCurve({'temperature': 50, 'speed': 75}),
                    PWMFanCurve({'temperature': 60, 'speed': 100})
                ],
                **pwm_fan
            })
        else:
            self.__pwm_fan = None
            self.__pwm_fan_config = None

        self.__shutdown = shutdown

    @property
    def has_pijuice(self):
        return self.__pijuice_config is not None

    @property
    def pijuice_config(self):
        return self.__pijuice_config

    @property
    def has_pwm_fan(self):
        return self.__pwm_fan_config is not None

    @property
    def pwm_fan_config(self):
        return self.__pwm_fan_config

    async def initialise(self):
        if self.has_pijuice:
            charge_battery = self.__pijuice_config['charge_battery']
            self.log_info(f'Charge PiJuice battery: {charge_battery}')
            self.__pijuice.charge_battery = charge_battery

            max_charge = self.__pijuice_config['max_charge']
            self.log_info(f'Charge up to maximum {max_charge}%')

            shutdown_delay = self.__pijuice_config['shutdown_delay']
            self.log_info(f'Shutdown after waiting for {shutdown_delay}s')

            shutdown_level = self.__pijuice_config['shutdown_level']
            self.log_info(f'Shutdown when battery is below {shutdown_level}%')

            wake_up_on_charge = self.__pijuice_config['wake_up_on_charge']
            self.log_info(
                f'Wake up when battery is above {wake_up_on_charge}%'
            )
            self.__pijuice.wake_up_on_charge = wake_up_on_charge

        if self.has_pwm_fan:
            self.log_info('Controlling PWM fan')

            for point in self.__pwm_fan_config['curve']:
                temp = point['temperature']
                speed = point['speed']
                self.log_info(f'At {temp}°C, set the fan to {speed}%')

            await self.__pwm_fan.initialise()

            self.__pwm_fan.curve = self.__pwm_fan_config['curve']

    async def deinitialise(self):
        if self.has_pwm_fan:
            await self.__pwm_fan.deinitialise()

        # when shutting down the service, broadcast the device is off
        if self.state != DeviceStatus.OFF:
            self.state = DeviceStatus.OFF

            # have to wait for the message to broadcast
            await sleep(1)

    async def poll(self):
        if self.state != DeviceStatus.ON:
            self.state = DeviceStatus.ON

        if self.has_pijuice:
            level = self.__pijuice.battery_level

            if level is not None:
                # send the shutdown command when the battery is too low
                if level <= self.__pijuice_config['shutdown_level']:
                    self.__pijuice.shutdown(
                        self.__pijuice_config['shutdown_delay']
                    )

                    self.__shutdown.shutdown(self)

                # if we've reached the max charge level, stop charging
                if level >= self.__pijuice_config['max_charge']:
                    if self.__pijuice.charge_battery:
                        self.log_info(f'Reached maximum charge at {level}%')
                        self.__pijuice.charge_battery = False
                else:
                    if not self.__pijuice.charge_battery:
                        self.log_info(f'Resuming charging at {level}%')
                        self.__pijuice.charge_battery = True

                # update the current charge level
                charging = self.__pijuice.battery_charging
                self.on_battery_change(level, charging)

        if self.has_pwm_fan:
            self.__poll_pwm()

    async def _turn_on(self):
        # the device is already on so nothing to do
        pass

    async def _turn_off(self):
        # we want to ignore this as the event can be generated by the ShutdownService
        pass

    def __poll_pwm(self):
        cpu_temps = self.__pwm_fan.cpu_temps
        battery_temps = self.__pwm_fan.battery_temps
        fan_speeds = self.__pwm_fan.fan_speeds

        self.__pwm_fan.clear()

        if len(cpu_temps) > 0:
            average = round(statistics.mean(cpu_temps), 1)

            self._broadcast(
                'cpu_temperature',
                {'value': average, 'unit': '°C'}
            )

        if self.has_pijuice and len(battery_temps) > 0:
            average = round(statistics.mean(battery_temps), 1)

            self._broadcast(
                'battery_temperature',
                {'value': average, 'unit': '°C'}
            )

        if len(fan_speeds) > 0:
            average = round(statistics.mean(fan_speeds), 1)

            self._broadcast(
                'fan_speed',
                {'value': average, 'unit': 'rpm'}
            )
