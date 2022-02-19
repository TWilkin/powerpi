import sys

from energenie_controller.container import ApplicationContainer
from energenie_controller.device.container import add_devices


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)

    controller = container.controller()
    controller.start()
