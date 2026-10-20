import sys

from hive_controller.container import ApplicationContainer


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])

    controller = container.common().controller()
    controller.start()
