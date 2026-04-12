from dependency_injector import containers, providers

from .arp import ARPProviderFactory, PacketARPProvider


class ServicesContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    common = providers.DependenciesContainer()
    device = providers.DependenciesContainer()
    config = providers.Dependency()

    arp_provider_factory = providers.Singleton(
        ARPProviderFactory,
        logger=common.logger,
        device_manager=device.device_manager,
        service_provider=service_provider
    )

    packet_arp_provider = providers.Singleton(
        PacketARPProvider,
        config=config,
        logger=common.logger
    )
