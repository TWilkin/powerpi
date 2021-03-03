from dependency_injector import containers, providers

from powerpi_common.container import Container as CommonContainer
from device.container import DeviceContainer


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    common = providers.Container(
        CommonContainer
    )

    service_provider = providers.Singleton(
        __self__
    )

    device = providers.Container(
        DeviceContainer,
        config=common.config,
        logger=common.logger,
        service_provider=service_provider
    )
