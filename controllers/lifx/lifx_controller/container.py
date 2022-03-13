from dependency_injector import containers, providers

from lifx_controller.__version__ import __app_name__, __version__
from lifx_controller.device.container import DeviceContainer
from powerpi_common.container import Container as CommonContainer


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    common = providers.Container(
        CommonContainer,
        app_name=__app_name__,
        version=__version__
    )

    device = providers.Container(
        DeviceContainer
    )
