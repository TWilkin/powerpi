from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.device import Device as ZigPyDevice
from zigpy.profiles.zha import DeviceType, PROFILE_ID
from zigpy.zcl.clusters.general import (
    Basic as BasicCluster,
    Groups as GroupsCluster,
    Identify as IdentityCluster,
    LevelControl as LevelControlCluster,
    OnOff as OnOffCluster,
    Ota as OTACluster,
    PollControl as PollControlCluster,
    PowerConfiguration as PowerConfigurationCluster,
    Scenes as ScenesCluster
)
from zigpy.zcl.clusters.lightlink import LightLink as LightLinkCluster
from zigpy.zdo.types import NodeDescriptor, LogicalType, FrequencyBand, MACCapabilityFlags

from zigbee_controller.zigbee.device import ZigbeeMixin
from zigbee_controller.zigbee.mixins import ZigbeeSleepyMixin
from zigbee_controller.zigbee import ZigbeeController


class IKEAStyrbarSensor(Sensor, ZigbeeMixin, ZigbeeSleepyMixin):
    '''
    Adds support for the IKEA Styrbar.
    '''

    def __init__(
        self,
        logger: Logger,
        controller: ZigbeeController,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)
        ZigbeeSleepyMixin.__init__(self)

        self._logger = logger

    async def initialise(self):
        await ZigbeeSleepyMixin.initialise(self)

    async def _bind_clusters(self):
        device = self._zigbee_device

        await self._bind_cluster(device[1].in_clusters[OnOffCluster.cluster_id])
        await self._bind_cluster(device[1].in_clusters[LevelControlCluster.cluster_id])
        await self._bind_cluster(device[1].in_clusters[ScenesCluster.cluster_id])

    def _configure_device(self, device: ZigPyDevice):
        device.node_desc = NodeDescriptor(
            logical_type=LogicalType.EndDevice,
            complex_descriptor_available=0,
            user_descriptor_available=0,
            reserved=0,
            aps_flags=0,
            frequency_band=FrequencyBand.Freq2400MHz,
            mac_capability_flags=MACCapabilityFlags.AllocateAddress,
            manufacturer_code=0x117C,
            maximum_buffer_size=82,
            maximum_incoming_transfer_size=82,
            server_mask=0,
            maximum_outgoing_transfer_size=82,
            descriptor_capability_field=0,
        )

        endpoint = device.add_endpoint(1)
        endpoint.profile_id = PROFILE_ID
        endpoint.device_type = DeviceType.NON_COLOR_CONTROLLER

        # add the input clusters
        for cluster_id in [
            BasicCluster.cluster_id,
            IdentityCluster.cluster_id,
            LightLinkCluster.cluster_id,
            PollControlCluster.cluster_id,
            PowerConfigurationCluster.cluster_id,
            0xFC7C  # IKEA proprietary
        ]:
            endpoint.add_input_cluster(cluster_id)

        # add the output clusters
        for cluster_id in [
            GroupsCluster.cluster_id,
            IdentityCluster.cluster_id,
            LevelControlCluster.cluster_id,
            LightLinkCluster.cluster_id,
            OnOffCluster.cluster_id,
            OTACluster.cluster_id,
            ScenesCluster.cluster_id
        ]:
            endpoint.add_output_cluster(cluster_id)

        device.model = "Remote Control N2"
        device.manufacturer = "IKEA of Sweden"
