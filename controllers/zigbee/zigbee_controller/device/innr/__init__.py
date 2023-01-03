from dependency_injector import providers

from .light import InnrLight


def add_innr_devices(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'innr_light_device',
        providers.Factory(
            InnrLight,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            controller=container.device.zigbee_controller
        )
    )
