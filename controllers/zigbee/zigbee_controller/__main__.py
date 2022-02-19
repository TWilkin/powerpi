import sys

from zigbee_controller.__version__ import __version__
from zigbee_controller.container import ApplicationContainer
from zigbee_controller.device.container import add_devices
from zigbee_controller.sensor import add_sensors


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)
    add_sensors(container)

    controller = container.controller()
    controller.start()
