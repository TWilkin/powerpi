import logging
import sys

from node_controller.container import ApplicationContainer
from node_controller.device.container import add_devices

if __name__ == '__main__':
    # turn off APScheduler's logging as the fan control runs too often
    logging.getLogger('apscheduler.executors.default').propagate = False

    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)

    controller = container.common().controller()
    controller.start()
