import sys

from node_controller.container import ApplicationContainer
from node_controller.devices.container import add_devices

if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)

    controller = container.common().controller()
    controller.start()
