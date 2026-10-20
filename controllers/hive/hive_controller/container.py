from dependency_injector import containers, providers
from powerpi_common.container import Container as CommonContainer

from hive_controller.__version__ import __app_name__, __version__
from hive_controller.devices.container import DeviceContainer


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
        DeviceContainer,
        logger=common.logger
    )
