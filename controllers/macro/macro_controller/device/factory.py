from dependency_injector.containers import Container

from powerpi_common.device import DeviceFactory, DeviceConfigType
from powerpi_common.logger import Logger


class RemoteDeviceFactory(DeviceFactory):
    def __init__(self, logger: Logger, service_provider: Container):
        DeviceFactory.__init__(self, logger, service_provider)

        self.__service_provider = service_provider

    def build(self, device_type: DeviceConfigType, instance_type: str, **kwargs):
        device = super().build(device_type, instance_type, **kwargs)

        if device is None and device_type == DeviceConfigType.DEVICE:
            factory = getattr(self.__service_provider, 'remote_device')

            device = factory(**kwargs)

        return device
