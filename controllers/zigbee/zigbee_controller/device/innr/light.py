from typing import Tuple, Union

from powerpi_common.config import Config
from powerpi_common.device import AdditionalStateDevice, DeviceStatus
from powerpi_common.device.mixin import AdditionalState, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util.data import DataType, Standardiser, restrict
from zigbee_controller.device.zigbee_controller import ZigbeeController
from zigbee_controller.zigbee import OnOff, ZigbeeMixin
from zigpy.exceptions import DeliveryError
from zigpy.zcl import Cluster
from zigpy.zcl.clusters.general import OnOff as OnOffCluster
from zigpy.zcl.clusters.lighting import Color as ColorCluster
from zigpy.zcl.foundation import Status


#pylint: disable=too-many-ancestors
class InnrLight(AdditionalStateDevice, PollableMixin, ZigbeeMixin):
    '''
    Adds support for Innr Smart RGB bulb.
    '''

    #pylint: disable=too-many-arguments
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        controller: ZigbeeController,
        duration: int = 500,
        **kwargs
    ):
        AdditionalStateDevice.__init__(
            self, config, logger, mqtt_client, **kwargs
        )
        PollableMixin.__init__(self, config, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)

        self.__duration = duration

        self.__standardiser = Standardiser({
            # the duration the bulb supports is measure in seconds
            DataType.DURATION: (
                lambda value: value / 1000,
                lambda value: value * 1000
            ),
            # the colour temperature the bulb supports is Kelvin / 10
            DataType.TEMPERATURE: (
                lambda value: value / 10,
                lambda value: value * 10
            )
        })

        self.__supports_temperature: Union[bool, None] = None
        self.__supports_colour: Union[bool, None] = None
        self.__colour_temp_range: Union[Tuple[int, int], None] = None

    @property
    def duration(self):
        return self.__standardiser.convert(DataType.DURATION, self.__duration)

    async def poll(self):
        # we need the capabilties to be set
        await self.__get_capabilities()

        device = self._zigbee_device
        changed = False

        try:
            # get the power state
            cluster: OnOffCluster = device[1].in_clusters[OnOffCluster.cluster_id]
            values, _ = await cluster.read_attributes(['on_off'])
            new_state = DeviceStatus.ON if values['on_off'] else DeviceStatus.OFF
            changed = new_state != self.state

            # get the additional state
            keys = []
            if self.__supports_temperature:
                keys.append('color_temperature')
            if self.__supports_colour:
                keys.extend(['current_hue', 'current_saturation'])

            cluster: ColorCluster = device[1].in_clusters[ColorCluster.cluster_id]
            values, _ = await cluster.read_attributes(keys)

            colour = {}

            if self.__supports_temperature:
                colour[DataType.TEMPERATURE] = self.__standardiser.revert(
                    DataType.TEMPERATURE,
                    values['color_temperature']
                )

            if self.__supports_colour:
                colour[DataType.HUE] = values['current_hue']
                colour[DataType.SATURATION] = values['current_saturation']

            changed |= colour != self.additional_state
            new_additional_state = {**self.additional_state, **colour}
        except DeliveryError:
            # we couldn't contact it so set to unknown
            new_state = DeviceStatus.UNKNOWN
            new_additional_state = self.additional_state
            changed = new_state != self.state

        if changed:
            self.set_state_and_additional(new_state, new_additional_state)

    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        if new_additional_state is not None:
            # we need the capabilties to be set
            await self.__get_capabilities()

            new_additional_state = {
                **self.additional_state,
                **new_additional_state
            }

            device = self._zigbee_device
            cluster: ColorCluster = device[1].in_clusters[ColorCluster.cluster_id]

            # update the colour temperature
            if self.__supports_temperature and DataType.TEMPERATURE in new_additional_state:
                command = 0x0A  # move_to_color_temp
                options = {
                    'color_temp_mireds': restrict(
                        self.__standardiser.revert(
                            DataType.TEMPERATURE,
                            new_additional_state[DataType.TEMPERATURE]
                        ),
                        self.__colour_temp_range
                    ),
                    'transition_time': self.duration
                }

                await self.__send_command(cluster, command, **options)

            # update the hue/saturation
            if self.__supports_colour \
                    and DataType.HUE in new_additional_state \
                    and DataType.SATURATION in new_additional_state:
                command = 0x06  # move_to_hue_and_saturation
                options = {
                    'hue': new_additional_state[DataType.HUE],
                    'saturation': new_additional_state[DataType.SATURATION],
                    'transition_time': self.duration
                }

                await self.__send_command(cluster, command, **options)

        return new_additional_state

    async def initialise(self):
        await self.__get_capabilities()

    def _additional_state_keys(self):
        keys = [DataType.BRIGHTNESS]

        if self.__supports_temperature:
            keys.append(DataType.TEMPERATURE)
        if self.__supports_colour:
            keys.extend([DataType.HUE, DataType.SATURATION])

        return keys

    async def _turn_on(self):
        return await self._update_device_state(DeviceStatus.ON)

    async def _turn_off(self):
        return await self._update_device_state(DeviceStatus.OFF)

    async def _update_device_state(self, new_state: DeviceStatus):
        device = self._zigbee_device
        cluster: OnOffCluster = device[1].in_clusters[OnOffCluster.cluster_id]

        command = OnOff.get(new_state)

        return await self.__send_command(cluster, command)

    async def __send_command(self, cluster: Cluster, command: int, **kwargs):
        try:
            result = await cluster.command(command, **kwargs)

            if result.status != Status.SUCCESS:
                self.log_error(
                    f'Command {command} failed with status {result.status}'
                )

                return False
        except DeliveryError:
            return False

        return True

    async def __get_capabilities(self):
        # if we already have the capabilties don't update
        if self.__supports_temperature is not None and self.__supports_colour is not None:
            return

        # find out what features are supported
        try:
            device = self._zigbee_device
            cluster: ColorCluster = device[1].in_clusters[ColorCluster.cluster_id]

            attributes, _ = await cluster.read_attributes([
                'color_capabilities',
                'color_temp_physical_min',
                'color_temp_physical_max'
            ])
            color_capabilities = attributes['color_capabilities']

            self.__supports_temperature = color_capabilities \
                & ColorCluster.ColorCapabilities.Color_temperature \
                == ColorCluster.ColorCapabilities.Color_temperature

            self.__supports_colour = color_capabilities \
                & ColorCluster.ColorCapabilities.Hue_and_saturation \
                == ColorCluster.ColorCapabilities.Hue_and_saturation

            self.__colour_temp_range = (
                attributes['color_temp_physical_min'], attributes['color_temp_physical_max']
            )
        except DeliveryError:
            pass

    def __str__(self):
        return ZigbeeMixin.__str__(self)
