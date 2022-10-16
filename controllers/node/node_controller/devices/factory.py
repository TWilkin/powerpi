from node_controller.config import NodeConfig
from powerpi_common.device import DeviceConfigType, DeviceFactory
from powerpi_common.logger import Logger


class NodeDeviceFactory(DeviceFactory):
    def __init__(
        self,
        config: NodeConfig,
        logger: Logger,
        service_provider
    ):
        DeviceFactory.__init__(self, logger, service_provider)

        self.__config = config

    def build(self, device_type: DeviceConfigType, instance_type: str, **kwargs):
        if device_type == DeviceConfigType.DEVICE and instance_type == 'node':
            name = kwargs.get('name', '').lower()

            if self.__config.node_hostname == name:
                instance_type = 'local_node'
            else:
                instance_type = 'remote_node'

        return DeviceFactory.build(
            self, device_type, instance_type, **kwargs
        )
