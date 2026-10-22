import sys

from hive_controller.container import ApplicationContainer
from hive_controller.device import add_devices
from hive_controller.sensor import add_sensors


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)
    add_sensors(container)

    controller = container.controller()
    controller.start()
