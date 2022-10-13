from dependency_injector import providers

from .node import NodeDevice


def add_devices(container):
    common_container = container.common()
    device_container = common_container.device()

    setattr(
        device_container,
        'node_device',
        providers.Factory(
            NodeDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            pijuice=container.pijuice
        )
    )
