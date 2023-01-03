from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from zigbee_controller.device.zigbee_controller import ZigbeeController
from zigbee_controller.zigbee import ZigbeeMixin


#pylint: disable=too-many-ancestors
class InnrLight(Device, ZigbeeMixin):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        controller: ZigbeeController,
        **kwargs
    ):
        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )
        ZigbeeMixin.__init__(self, controller, **kwargs)
