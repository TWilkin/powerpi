from asyncio import sleep
from typing import TypedDict, Union

from node_controller.pijuice import PiJuiceInterface
from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import InitialisableMixin, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor.mixin import BatteryMixin

PiJuiceConfig = TypedDict(
    'PiJuiceConfig',
    {'charge_battery': bool, 'shutdown_level': int, 'wake_up_on_charge': int},
    total=False
)


class LocalNodeDevice(Device, InitialisableMixin, PollableMixin, BatteryMixin):
    # pylint: disable=too-many-ancestors
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        service_provider,
        pijuice: Union[PiJuiceConfig, None] = None,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)
        BatteryMixin.__init__(self)

        if pijuice is not None:
            self.__pijuice: PiJuiceInterface = service_provider.pijuice_interface()

            # set the config with defaults
            self.__pijuice_config = PiJuiceConfig({
                'charge_battery': True,
                'shutdown_level': 15,
                'wake_up_on_charge': 20,
                **pijuice
            })
        else:
            self.__pijuice_config = None

    @property
    def has_pijuice(self):
        return self.__pijuice_config is not None

    async def initialise(self):
        if self.has_pijuice:
            charge_battery = self.__pijuice_config['charge_battery']
            self.log_info(f'Charge PiJuice battery: {charge_battery}')
            self.__pijuice.charge_battery = charge_battery

            shutdown_level = self.__pijuice_config['shutdown_level']
            self.log_info(f'Shutdown when battery is below {shutdown_level}%')

            wake_up_on_charge = self.__pijuice_config['wake_up_on_charge']
            self.log_info(
                f'Wake up when battery is above {wake_up_on_charge}%')
            self.__pijuice.wake_up_on_charge = wake_up_on_charge

    async def deinitialise(self):
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
                charging = self.__pijuice.battery_charging
                self.on_battery_change(level, charging)

    async def _turn_on(self):
        raise NotImplementedError

    async def _turn_off(self):
        raise NotImplementedError
