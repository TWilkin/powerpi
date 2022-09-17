from dependency_injector import containers, providers

from bluetooth_controller.device.bluetooth_controller import \
    BluetoothController


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    bluetooth_controller = providers.Singleton(
        BluetoothController,
        logger=logger
    )


def add_devices(container):
    pass
