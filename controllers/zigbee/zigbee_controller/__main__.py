import asyncio
import sys

from dependency_injector.wiring import inject

from zigbee_controller.__version import __version__
from zigbee_controller.container import ApplicationContainer


@inject
async def main():
    pass


if __name__ == '__main__':
    # initialise DI
    container = ApplicationContainer()
    container.wire(modules=[sys.modules[__name__]])

    coro = main()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(coro)
