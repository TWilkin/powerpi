import math
from asyncio import ensure_future
from typing import List, Tuple, Union

from powerpi_common.config import Config
from powerpi_common.device import AdditionalStateDevice, DeviceStatus
from powerpi_common.device.mixin import AdditionalState, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util.data import DataType, Range, Ranges, Standardiser
from zigbee_controller.device.zigbee_controller import ZigbeeController
from zigbee_controller.zigbee import DeviceAnnounceListener, ZigbeeMixin
from zigpy.exceptions import DeliveryError
from zigpy.types import bitmap8
from zigpy.typing import DeviceType
from zigpy.zcl import Cluster
from zigpy.zcl.clusters.general import LevelControl as LevelControlCluster
from zigpy.zcl.clusters.general import OnOff as OnOffCluster
from zigpy.zcl.clusters.lighting import Color as ColorCluster


# pylint: disable=too-many-ancestors
class ZigbeeLight(AdditionalStateDevice, PollableMixin, ZigbeeMixin):
    '''
    Adds support for ZigBee RGB/temperature/brightness lights.
    '''

    __standardiser = Standardiser({
        # brightness is uint8 and we want a uint16,
        # TODO this should be a percentage, but making consistent with LIFX for now
        DataType.BRIGHTNESS: (
            lambda value: math.ceil(
                (value / Ranges.UINT16.max) * Ranges.UINT8.max),
            lambda value: math.ceil(
                (value / Ranges.UINT8.max) * Ranges.UINT16.max),
            Ranges.UINT8
        ),
        # the duration the bulb supports seems to be 1/10 a second
        DataType.DURATION: (
            lambda value: math.ceil(value / 100),
            lambda value: math.ceil(value * 100)
        ),
        # convert from Kelvin to mired and vice versa
        DataType.TEMPERATURE: (
            # mired = 1m / kelvin
            lambda value: 0 if value == 0 else math.ceil(1_000_000 / value),
            # kelvin = 1m / mired
            lambda value: 0 if value == 0 else math.ceil(1_000_000 / value),
            Ranges.UINT16
        ),
        # hue is 0-360
        DataType.HUE: (
            lambda value: math.ceil((value / 360) * 254),
            lambda value: math.ceil((value / 254) * 360),
            Ranges.UINT8
        ),
        # saturation is a percentage
        DataType.SATURATION: (
            lambda value: math.ceil((value / 100) * 254),
            lambda value: math.ceil((value / 254) * 100),
            Ranges.UINT8
        ),
    })

    # pylint: disable=too-many-arguments
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

        self.__options_set = False
        self.__supports_temperature: Union[bool, None] = None
        self.__supports_colour: Union[bool, None] = None
        self.__colour_temp_range: Union[Range, None] = None

    @property
    def duration(self):
        return self.__standardiser.convert(DataType.DURATION, self.__duration)

    @property
    def supports_colour(self):
        return self.__supports_colour

    @property
    def supports_temperature(self):
        return self.__supports_temperature

    @property
    def temperature_range(self):
        return self.__colour_temp_range

    async def poll(self):
        # we need the device to be initialised
        await self.__initialise()

        device = self._zigbee_device
        changed = False

        try:
            # get the power state
            cluster: OnOffCluster = device[1].in_clusters[OnOffCluster.cluster_id]
            values, _ = await cluster.read_attributes(['on_off'])
            new_state = DeviceStatus.ON if values['on_off'] else DeviceStatus.OFF
            changed = new_state != self.state

            # get the additional state
            updated_additonal_state = {}

            # get the brightness
            cluster: LevelControlCluster = device[1].in_clusters[LevelControlCluster.cluster_id]
            values, _ = await cluster.read_attributes(['current_level'])

            updated_additonal_state[DataType.BRIGHTNESS] = self.__standardiser.revert(
                DataType.BRIGHTNESS,
                values['current_level']
            )

            # get the colour state (if supported)
            keys = []
            if self.__supports_temperature:
                keys.append('color_temperature')
            if self.__supports_colour:
                keys.extend(['current_hue', 'current_saturation'])

            if len(keys) > 0:
                cluster: ColorCluster = device[1].in_clusters[ColorCluster.cluster_id]
                values, _ = await cluster.read_attributes(keys)

                if self.__supports_temperature:
                    updated_additonal_state[DataType.TEMPERATURE] = self.__standardiser.revert(
                        DataType.TEMPERATURE,
                        values['color_temperature']
                    )

                if self.__supports_colour:
                    updated_additonal_state[DataType.HUE] = self.__standardiser.revert(
                        DataType.HUE,
                        values['current_hue']
                    )

                    updated_additonal_state[DataType.SATURATION] = self.__standardiser.revert(
                        DataType.SATURATION,
                        values['current_saturation']
                    )

            changed |= updated_additonal_state != self.additional_state
            new_additional_state = {
                **self.additional_state,
                **updated_additonal_state
            }
        except DeliveryError:
            # we couldn't contact it so set to unknown
            new_state = DeviceStatus.UNKNOWN
            new_additional_state = self.additional_state
            changed = new_state != self.state

        if changed:
            self.set_state_and_additional(new_state, new_additional_state)

    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        if new_additional_state is not None:
            # we need the device to be initialised
            await self.__initialise()

            new_additional_state = {
                **self.additional_state,
                **new_additional_state
            }

            # update the brightness
            if DataType.BRIGHTNESS in new_additional_state:
                if not await self.__set_brightness(new_additional_state[DataType.BRIGHTNESS]):
                    new_additional_state[DataType.BRIGHTNESS] = getattr(
                        self.additional_state, DataType.BRIGHTNESS, None
                    )

            # update the colour temperature
            if DataType.TEMPERATURE in new_additional_state:
                if not await self.__set_temperature(new_additional_state[DataType.TEMPERATURE]):
                    new_additional_state[DataType.TEMPERATURE] = getattr(
                        self.additional_state, DataType.TEMPERATURE, None
                    )

            # update the hue/saturation
            if DataType.HUE in new_additional_state and DataType.SATURATION in new_additional_state:
                if not await self.__set_hue_saturation(
                    new_additional_state[DataType.HUE],
                    new_additional_state[DataType.SATURATION]
                ):
                    new_additional_state[DataType.HUE] = getattr(
                        self.additional_state, DataType.HUE, None
                    )
                    new_additional_state[DataType.SATURATION] = getattr(
                        self.additional_state, DataType.SATURATION, None
                    )

        return new_additional_state

    async def initialise(self):
        # when the device joins the network retrieve its capabilities and set the options
        self._add_zigbee_listener(
            DeviceAnnounceListener(self.__on_device_announce)
        )

        # also call it now in case it's already on
        await self.__initialise()

    def _additional_state_keys(self):
        keys = [DataType.BRIGHTNESS]

        if self.__supports_temperature:
            keys.append(DataType.TEMPERATURE)
        if self.__supports_colour:
            keys.extend([DataType.HUE, DataType.SATURATION])

        return keys

    async def _turn_on(self):
        return await self.__set_power_state(DeviceStatus.ON)

    async def _turn_off(self):
        return await self.__set_power_state(DeviceStatus.OFF)

    def __on_device_announce(self, device: DeviceType):
        if device.nwk == self.nwk and device.ieee == self.ieee:
            ensure_future(self.__initialise())

    async def __initialise(self):
        # retrieve what capabilities this device supports
        await self.__get_capabilities()

        # configure the device
        await self.__set_options()

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

            self.__colour_temp_range = Range(
                attributes['color_temp_physical_min'], attributes['color_temp_physical_max']
            )
        except DeliveryError:
            pass

    async def __set_options(self):
        # if we already set the options, don't update
        if self.__options_set:
            return

        device = self._zigbee_device

        # the options for each cluster
        pairs: List[Tuple[Cluster, bitmap8]] = zip([
            device[1].in_clusters[ColorCluster.cluster_id],
            device[1].in_clusters[LevelControlCluster.cluster_id]
        ], [
            ColorCluster.Options.Execute_if_off,
            LevelControlCluster.Options.Execute_if_off
        ])

        try:
            for cluster, options in pairs:
                await cluster.write_attributes({'options': options})

            self.__options_set = True
        except DeliveryError:
            self.__options_set = False

    async def __set_power_state(self, new_state: DeviceStatus):
        device = self._zigbee_device
        cluster: LevelControlCluster = device[1].in_clusters[LevelControlCluster.cluster_id]

        command = cluster.commands_by_name['move_to_level_with_on_off'].id

        brightness = getattr(self.additional_state, 'brightness', Ranges.UINT16.max) \
            if new_state == DeviceStatus.ON else 0

        options = {
            'level': self.__standardiser.convert(
                DataType.BRIGHTNESS,
                brightness
            ),
            'transition_time': self.duration
        }

        return await self._send_command(cluster, command, **options)

    async def __set_brightness(self, brightness: int):
        cluster: LevelControlCluster = self._zigbee_device[1] \
            .in_clusters[LevelControlCluster.cluster_id]

        command = cluster.commands_by_name['move_to_level'].id

        options = {
            'level': self.__standardiser.convert(
                DataType.BRIGHTNESS,
                brightness
            ),
            'transition_time': self.duration
        }

        success = await self._send_command(cluster, command, **options)

        await cluster.write_attributes({'start_up_current_level': options['level']})

        return success

    async def __set_temperature(self, temperature: int):
        if self.__supports_temperature:
            cluster: ColorCluster = self._zigbee_device[1] \
                .in_clusters[ColorCluster.cluster_id]

            command = cluster.commands_by_name['move_to_color_temp'].id

            options = {
                'color_temp_mireds': self.__colour_temp_range.restrict(
                    self.__standardiser.convert(
                        DataType.TEMPERATURE,
                        temperature
                    )
                ),
                'transition_time': self.duration
            }

            success = await self._send_command(cluster, command, **options)

            await cluster.write_attributes({
                'start_up_color_temperature': options['color_temp_mireds']
            })

            return success
        return False

    async def __set_hue_saturation(self, hue: int, saturation: int):
        if self.__supports_colour:
            cluster: ColorCluster = self._zigbee_device[1] \
                .in_clusters[ColorCluster.cluster_id]

            command = cluster.commands_by_name['move_to_hue_and_saturation'].id

            options = {
                'hue': self.__standardiser.convert(
                    DataType.HUE,
                    hue
                ),
                'saturation': self.__standardiser.convert(
                    DataType.SATURATION,
                    saturation
                ),
                'transition_time': self.duration
            }

            return await self._send_command(cluster, command, **options)
        return False

    def __str__(self):
        return ZigbeeMixin.__str__(self)
