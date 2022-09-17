from dependency_injector import containers, providers

from .controller import BluetoothController


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    bluetooth_controller = providers.Singleton(
        BluetoothController
    )


def add_devices(container):
    pass
