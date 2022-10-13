import sys

from node_controller.container import ApplicationContainer, add_sensors

if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_sensors(container)

    controller = container.common().controller()
    controller.start()
