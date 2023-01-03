from powerpi_common.config import Config
from powerpi_common.device import AdditionalStateDevice, DeviceStatus
from powerpi_common.device.mixin import AdditionalState, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from zigbee_controller.device.zigbee_controller import ZigbeeController
from zigbee_controller.zigbee import OnOff, ZigbeeMixin
from zigpy.zcl.clusters.general import OnOff as OnOffCluster
from zigpy.zcl.foundation import Status


#pylint: disable=too-many-ancestors
class InnrLight(AdditionalStateDevice, PollableMixin, ZigbeeMixin):
    '''
    Adds support for Innr Smart RGB bulb.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        controller: ZigbeeController,
        **kwargs
    ):
        AdditionalStateDevice.__init__(
            self, config, logger, mqtt_client, **kwargs
        )
        PollableMixin.__init__(self, config, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)

    async def poll(self):
        pass

    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        pass

    async def initialise(self):
        pass

    def _additional_state_keys(self):
        # TODO find a way to dynamically identify which are supported by the bulb
        return ['brightness', 'temperature', 'hue', 'saturation']

    async def _turn_on(self):
        await self._update_device_state(DeviceStatus.ON)

    async def _turn_off(self):
        await self._update_device_state(DeviceStatus.OFF)

    async def _update_device_state(self, new_state: DeviceStatus):
        command = OnOff.get(new_state)

        device = self._zigbee_device
        cluster: OnOffCluster = device[1].in_clusters[OnOffCluster.cluster_id]

        result = await cluster.command(command)

        if result.status != Status.SUCCESS:
            self.log_error(f'Command failed with status {result.status}')
            return False

        return True
