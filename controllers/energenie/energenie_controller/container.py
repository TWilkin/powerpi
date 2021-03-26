from dependency_injector import containers, providers

from powerpi_common.container import Container as CommonContainer
from energenie_controller.__version import __app_name__
from energenie_controller.config import EnergenieConfig


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    common = providers.Container(
        CommonContainer,
        app_name=__app_name__
    )

    config = providers.Singleton(
        EnergenieConfig
    )
