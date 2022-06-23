from powerpi_common.device import DeviceFactory, DeviceConfigType
from powerpi_common.logger import Logger
from powerpi_common.variable import VariableManager


class RemoteDeviceFactory(DeviceFactory):
    def __init__(
        self,
        logger: Logger,
        device_service_provider,
        variable_service_provider
    ):
        DeviceFactory.__init__(self, logger, device_service_provider)

        self.__device_service_provider = device_service_provider

        # have to get VariableManager this way to prevent cyclic instantiation
        self.__variable_service_provider = variable_service_provider
        self.__variable_manager: VariableManager = None

    def build(self, device_type: DeviceConfigType, instance_type: str, **kwargs):
        device = DeviceFactory.build(
            self, device_type, instance_type, **kwargs
        )

        if device is None and device_type == DeviceConfigType.DEVICE:
            device = self.__device_service_provider.remote_device(**kwargs)

            if self.__variable_manager is None:
                self.__variable_manager = self.__variable_service_provider.variable_manager()

            self.__variable_manager.add(device)

        return device
