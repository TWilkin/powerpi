import sys

from bluetooth_controller.container import ApplicationContainer
from bluetooth_controller.device import add_devices
from bluetooth_controller.sensor import add_sensors

if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)
    add_sensors(container)

    controller = container.common().controller()
    controller.start()
