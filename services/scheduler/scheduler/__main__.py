import sys

from dependency_injector import providers
from scheduler.container import ApplicationContainer

if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])

    # override config
    container.common().config.override(providers.Singleton(
        container.config
    ))

    app = container.application()
    app.start()
