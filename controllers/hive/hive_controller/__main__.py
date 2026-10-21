import asyncio
import sys

from hive_controller.container import ApplicationContainer
from hive_controller.device.container import add_devices


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])
    add_devices(container)

    client = container.device().hive_client()
    asyncio.run(client.connect())

    controller = container.common().controller()
    controller.start()
