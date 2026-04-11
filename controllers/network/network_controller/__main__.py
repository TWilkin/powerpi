import sys

from network_controller.container import ApplicationContainer
from network_controller.device.container import add_devices
from network_controller.sensor.container import add_sensors

if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)
    add_sensors(container)

    controller = container.common().controller()
    controller.start()
