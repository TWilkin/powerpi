from dependency_injector import providers

from .presence import PresenceSensor


def add_sensors(container):
    common_container = container.common()
    services_container = container.services()
    device_container = common_container.device()

    setattr(
        device_container,
        'network_presence_sensor',
        providers.Factory(
            PresenceSensor,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            arp_factory=services_container.arp_factory
        )
    )
