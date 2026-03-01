from dependency_injector import providers

from .stybar import IKEAStyrbarSensor


def add_ikea_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'ikea_styrbar',
        providers.Factory(
            IKEAStyrbarSensor,
            logger=container.common.logger,
            controller=container.zigbee_controller,
            mqtt_client=container.common.mqtt_client
        )
    )
