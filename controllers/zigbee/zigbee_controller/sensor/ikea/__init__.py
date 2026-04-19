from dependency_injector import providers

from .stybar import IKEAStyrbarSensor


def add_ikea_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'ikea_styrbar_sensor',
        providers.Factory(
            IKEAStyrbarSensor,
            controller=container.zigbee_controller
        )
    )
