import sys

from snapcast_controller.container import ApplicationContainer
from snapcast_controller.device.container import add_devices

if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)

    controller = container.common().controller()
    controller.start()
