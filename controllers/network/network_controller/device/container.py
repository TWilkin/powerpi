from dependency_injector import providers

from .computer import ComputerDevice


def add_devices(container):
    common_container = container.common()
    device_container = common_container.device()

    setattr(
        device_container,
        'computer_device',
        providers.Factory(
            ComputerDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client
        )
    )
