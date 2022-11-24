from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import DeviceOrchestratorMixin, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


#pylint: disable=too-many-ancestors
class ConditionDevice(Device, DeviceOrchestratorMixin, PollableMixin):
    #pylint: disable=too-many-arguments
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        device: str,
        **kwargs
    ):
        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )
        DeviceOrchestratorMixin.__init__(
            self, config, logger, mqtt_client, device_manager, [device]
        )
        PollableMixin.__init__(self, config, **kwargs)

    async def on_referenced_device_status(self, _: str, __: DeviceStatus):
        await self.poll()

    async def poll(self):
        pass

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass
