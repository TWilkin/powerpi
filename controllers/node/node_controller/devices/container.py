from dependency_injector import providers
from node_controller.config import NodeConfig
from node_controller.pijuice import PiJuiceImpl

from .node import NodeDevice


def add_devices(container):
    common_container = container.common()
    device_container = common_container.device()

    # override the config
    common_container.config.override(providers.Singleton(
        NodeConfig
    ))

    setattr(
        device_container,
        'pijuice',
        providers.Factory(
            PiJuiceImpl,
            config=container.common.config,
            logger=container.common.logger
        )
    )

    setattr(
        device_container,
        'node_device',
        providers.Factory(
            NodeDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            pijuice=container.common.device.pijuice
        )
    )
