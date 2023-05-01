import sys

from scheduler.container import ApplicationContainer

if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
