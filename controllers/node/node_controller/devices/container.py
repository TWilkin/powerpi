from dependency_injector import providers
from node_controller.config import NodeConfig
from node_controller.pijuice import PiJuiceImpl

from .factory import NodeDeviceFactory
from .local_node import LocalNodeDevice
from .remote_node import RemoteNodeDevice


def add_devices(container):
    common_container = container.common()
    device_container = common_container.device()

    # override the config
    common_container.config.override(providers.Singleton(
        NodeConfig
    ))

    # override the factory
    device_container.device_factory.override(providers.Factory(
        NodeDeviceFactory,
        config=container.common.config,
        logger=container.common.logger,
        service_provider=container.common.device.service_provider
    ))

    setattr(
        device_container,
        'pijuice_interface',
        providers.Factory(
            PiJuiceImpl,
            config=container.common.config,
            logger=container.common.logger
        )
    )

    setattr(
        device_container,
        'local_node_device',
        providers.Factory(
            LocalNodeDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            pijuice_interface=container.common.device.pijuice_interface
        )
    )

    setattr(
        device_container,
        'remote_node_device',
        providers.Factory(
            RemoteNodeDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client
        )
    )
