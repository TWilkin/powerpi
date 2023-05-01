from dependency_injector import containers, providers


class ApplicationContainer(containers.DeclarativeContainer):

    __sele__ = providers.Self()
