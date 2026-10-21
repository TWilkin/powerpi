from dependency_injector import containers, providers
from powerpi_common.container import Container as CommonContainer

from hive_controller.__version__ import __app_name__, __version__
from hive_controller.config import HiveConfig
from hive_controller.device.container import DeviceContainer


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Singleton(
        HiveConfig
    )

    common = providers.Container(
        CommonContainer,
        app_name=__app_name__,
        version=__version__,
        config=config
    )

    device = providers.Container(
        DeviceContainer,
        config=config,
        logger=common.logger
    )
