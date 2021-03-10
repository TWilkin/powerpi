from dependency_injector import containers, providers

from powerpi_common.container import Container as CommonContainer
from harmony_controller.__version import __app_name__
from harmony_controller.device.container import DeviceContainer


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    common = providers.Container(
        CommonContainer,
        app_name=__app_name__
    )

    device = providers.Container(
        DeviceContainer,
        logger=common.logger
    )
