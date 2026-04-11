from dependency_injector import containers, providers

from .arp import ARPFactory, LocalARPListener


class ServicesContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    common = providers.DependenciesContainer()

    arp_factory = providers.Singleton(
        ARPFactory,
        service_provider=service_provider
    )

    local_arp_listener = providers.Singleton(
        LocalARPListener,
        logger=common.logger
    )
