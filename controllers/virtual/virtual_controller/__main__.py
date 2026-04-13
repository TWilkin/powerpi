import sys

from virtual_controller.container import ApplicationContainer
from virtual_controller.device.container import add_devices
from virtual_controller.sensor.container import add_sensors

if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)
    add_sensors(container)

    controller = container.common().controller()
    controller.start()
