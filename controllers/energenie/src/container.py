from dependency_injector import containers, providers

from __version import __app_name__
from powerpi_common.container import Container as CommonContainer
from device.container import DeviceContainer


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
        config=common.config,
        logger=common.logger,
        common=common
    )
