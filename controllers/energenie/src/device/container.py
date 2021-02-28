from dependency_injector import providers

from common.container import Container as CommonContainer

from . manager import DeviceManager


class Container(CommonContainer):

    devices = providers.Singleton(
        DeviceManager
    )
